import { chakra } from '@chakra-ui/react'
export const SelectOption = chakra('option', {
  baseStyle: {
    size: 'lg',
    focusBorderColor: 'blue.500',
    bgColor: 'gray.50',
    borderColor: 'gray.400',
    boder: 'solid 1px',
    variant: 'filled',
  }
})
