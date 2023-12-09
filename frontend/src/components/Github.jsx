import { FaGithub as GithubIcon } from "react-icons/fa"
import styled from "styled-components"

export const Github = styled.div`
  background: #fff;
  border-radius: 100%;
  padding: 0.1rem;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  user-select: none;
  cursor: pointer;
`

const GithubComponent = () => (
  <Github
    onClick={() =>
      window.open("https://github.com/MatEE404/online-paint", "_blank")
    }>
    <GithubIcon />
  </Github>
)

export default GithubComponent
