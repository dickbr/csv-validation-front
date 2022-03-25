import {
  Button,
  Flex,
  Input,
  Stack,
  Heading,
  Text,
  Link,
  CircularProgress,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Icon,
  Box,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { api_campaing } from '../services/api';
import Papa from "papaparse";
import { RiCheckFill, RiCloseFill } from 'react-icons/ri'

type ValidateFileResponse = {
  phone: string
  previousMessage: string
  isValid: boolean
}

type ContentFileResponse = {
  name: string
  countValidMessages: number,
  data: ValidateFileResponse[]
}

export default function SplitScreen(): JSX.Element {

  const inputFile = useRef<any>(null)
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [contentFileResponse, setContentFileResponse] = useState<ContentFileResponse>();


  const uploadResponse = useMutation(async ({
    csv: {
      data: fileData
    },
    name
  }: any): Promise<any> => {

    setTimeout(async () => {
      const body = {
        name,
        data: fileData
      }
      const { data } = await api_campaing.post('/campaign/validate', body, {
        headers: {
          "Content-Type": `application/json`,
        }
      })
      setUploading(false);
      if (data.data) {
        setContentFileResponse({
          data: data.data,
          countValidMessages: data.countValidMessages,
          name: data.name
        })
      }

    }, 5000);


  }, {
    onSuccess: async (): Promise<void> => {
    },
    onError: (error: any): void => {

    }
  })

  const saveContent = useMutation(async (): Promise<any> => {

    const body = {
      name: contentFileResponse?.name,
      data: contentFileResponse?.data
    }
    await api_campaing.post('/campaign/contacts', body, {
      headers: {
        "Content-Type": `application/json`,
      }
    })
  }, {
    onSuccess: async (): Promise<void> => {
      setSuccess(true)
    },
    onError: (error: any): void => {
      setSuccess(false)
    }
  })

  const linkDownloadTemplate = process.env.CAMPAING_API_URL?.concat('/campaign/template')

  const onButtonClick = (event: any) => {
    event?.preventDefault()
    if (inputFile) inputFile?.current?.click();
  };


  const onSaveContent = async (event: any) => {
    event?.preventDefault()
    await saveContent.mutateAsync()
  };

  const onCancelContent = (event: any) => {
    event?.preventDefault()
    window.location.href = '/'
  };

  const onInputChange = async (event: any) => {
    setUploading(true);
    const name = event.target.files[0].name
    const input = inputFile?.current;
    const reader = new FileReader();
    const [file] = input?.files;

    reader.onloadend = async ({ target }: any) => {
      const csv = Papa.parse(target?.result, { header: false, delimiter: ';' });
      await uploadResponse.mutateAsync({ csv, name })
    };

    reader.readAsText(file);

  };

  return (
    <Stack minH={'100vh'}>
      <Flex
        flexDirection='column'
        alignContent='center'
        alignItems='center'
        justifyContent='center'
        justifyItems='center'
        minH={'100vh'}
      >
        <Flex
          mt='30px'
          mb='30px'
          flexDirection='column'
          alignContent='center'
          alignItems='center'
          justifyContent='center'
          as="form"
          borderRadius='15px'
          border='4px solid blue'
          p='20'
          w='60%'
        >
          {uploading && !contentFileResponse

            ? <>
              <Heading color='black'>Estamos verificando todas as <br /> mensagens em seu arquivo...</Heading>
              <CircularProgress mt='80px' mb='20px' isIndeterminate color='green.300' />
              <Text mt='15px' fontSize='sm' color='gray.500'>Você quer <Link href='/' color='blue.500'>cancelar e voltar ao início?</Link></Text>
            </>
            : !uploading && !contentFileResponse ? <>
              <Heading textAlign='center' color='black'>Verifique a validade de uma <br /> lista de mensagens 👍</Heading>
              <Input
                border='1px solid'
                name='fileCsv'
                display='none'
                type='file'
                ref={inputFile}
                onChange={onInputChange}
              />
              <Button
                mt='50px'
                mb='50px'
                type='submit'
                color='white'
                p='7'
                _hover={{
                  bg: 'blue.400'
                }}
                bg='blue.600'
                onClick={onButtonClick}
              >
                Selecionar lista
              </Button>

              <Text fontSize='xl' textAlign='center' color='black'>Selecione um arquivo CSV para iniciar a verifição <br /> de uma lista com numeros e mensagens de SMS. </Text>
              <Text mt='15px' fontSize='sm' color='gray.500'>Use nosso <Link href={linkDownloadTemplate} color='blue.500'>modelo</Link> de arquivo se você tem alguma dúvida.</Text>
            </>
              : !success ? <>
                <Flex>
                  <Heading
                    w='100%'
                    color='black'
                    textAlign='center'
                    mb='40px'
                  >
                    Encontramos
                    <span style={{
                      color: 'green'
                    }}>{' ' + contentFileResponse?.countValidMessages + ' '}</span>
                    mensagens <br />
                    válidas em sua lista 🎉
                  </Heading>
                  {/* <Heading color='green'>{'' + contentFileResponse?.countValidMessages}</Heading> */}

                  {/* <Heading
                    w='100%'
                    color='black'
                    textAlign='center'
                    mb='40px'
                  >
                    mensagens <br />
                    válidas em sua lista 🎉
                  </Heading> */}
                </Flex>

                <Table variant='simple'>
                  <Thead>
                    <Tr>
                      <Th>Número</Th>
                      <Th>Prévia da mensagem</Th>
                      <Th>Resultado</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {
                      contentFileResponse?.data.map((content, index) => {
                        return (
                          <>
                            {content.phone &&
                              <Tr>
                                <Td fontSize='sm'>{content.phone}</Td>
                                <Td fontSize='sm'>{content.previousMessage}</Td>
                                <Td fontSize='sm' textAlign='right'>{content.isValid
                                  ?
                                  <Flex alignItems='center' justifyContent='center' justifyItems='center' alignContent='center'>
                                    {'Válida'}
                                    <Icon as={RiCheckFill} color='green.500' fontSize='25px' ml='5px' />
                                  </ Flex>

                                  :
                                  <Flex alignItems='center' justifyContent='center' justifyItems='center' alignContent='center'>
                                    {'Inválida'}
                                    < Icon as={RiCloseFill} color='red.500' fontSize='25px' ml='5px' />
                                  </ Flex>
                                }</Td>
                              </Tr>
                            }
                          </>

                        )
                      })
                    }

                  </Tbody>
                </Table>

                <Heading
                  w='100%'
                  color='black'
                  textAlign='center'
                  mt='40px'
                  mb='40px'
                  fontSize='2xl'
                >Está pronto para prosseguir? 🤔</Heading>


                <Flex alignItems='center' justifyContent='center' justifyItems='center' alignContent='center'>
                  <Button
                    mb='50px'
                    type='submit'
                    color='gray.500'
                    colorScheme='teal'
                    variant='outline'
                    w='150px'
                    mr='15px'
                    p='7'
                    _hover={{
                      bg: 'gray.200'
                    }}
                    bg='white'
                    onClick={onCancelContent}
                    rightIcon={< Icon as={RiCloseFill} color='gray.500' fontSize='25px' ml='5px' />}
                  >
                    Cencelar
                  </Button>

                  <Button
                    mb='50px'
                    type='submit'
                    color='white'
                    w='150px'
                    p='7'
                    _hover={{
                      bg: 'blue.400'
                    }}
                    bg='blue.600'
                    onClick={onSaveContent}
                    rightIcon={< Icon as={RiCheckFill} color='white' fontSize='25px' ml='5px' />}
                  >
                    Salvar lista
                  </Button>
                </Flex>
              </>
                : <>
                  <Heading
                    w='100%'
                    color='blue.500'
                    textAlign='center'
                    mt='40px'
                    mb='30px'
                  >É isso aí! 🚀</Heading>`

                  <Heading
                    w='100%'
                    color='black'
                    textAlign='center'
                    mb='20px'
                  >Sua lista está pronta para <br /> entrar em produção!</Heading>

                  <Text fontSize='md' color='black' textAlign='center'>Já guardamos todas as mensagens válidas para que <br /> voçe possa usá-las em uma campanha no futuro. </Text>
                  <Text mt='15px' fontSize='sm' color='gray.500'><Link href='/' color='blue.500'>Voltar ao início</Link> para iniciar outra verificação</Text>
                </>

          }
        </Flex>
      </Flex>

    </Stack >
  );
}
