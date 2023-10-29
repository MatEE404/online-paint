import { useEffect, useRef } from "react"
import styled from "styled-components"

const LoadingScreen = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(1rem);
  top: 0;
  left: 0;
  z-index: 10000;
  transition: all 0.7s ease-in-out;
  opacity: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  cursor: none;
  user-select: none;

  ${({ isLoading }) => (!isLoading ? "opacity: 0;" : "")}

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 200px;
  }
`

const Title = styled.h1`
  font-size: 2rem;
  color: #555;
  font-weight: bold;
  text-transform: uppercase;
`

const LoadingComponent = ({ isLoading }) => {
  const loadingRef = useRef()

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        loadingRef.current.style.display = "none"
      }, 650)
    }
  }, [isLoading])

  return (
    <LoadingScreen ref={loadingRef} isLoading={isLoading}>
      <Title>Loading</Title>
    </LoadingScreen>
  )
}

export default LoadingComponent
