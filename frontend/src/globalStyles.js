import { createGlobalStyle } from "styled-components"

const GlobalStyle = createGlobalStyle`
  * {
    font-family: Arial, Helvetica, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  :root {
    font-family: 24px;
  }
  body {
    margin: 0;
    padding: 0;
  }
`

export default GlobalStyle
