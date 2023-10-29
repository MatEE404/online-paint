import styled from "styled-components"

export const Players = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  z-index: 9999;
  user-select: none;
  cursor: none;
`

const Dot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 100%;
  background: red;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    border-radius: 100%;
    background: rgba(255, 0, 0, 0.3);
  }
`

const PlayersComponent = ({ players }) => {
  if (players > 1) {
    return (
      <Players>
        <Dot />
        {players}
      </Players>
    )
  } else return <></>
}

export default PlayersComponent
