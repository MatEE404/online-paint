import styled from "styled-components"

export const Container = styled.main`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`

export const Panel = styled.section`
  position: fixed;
  top: 0;
  left: 0;
  width: 100px;
  height: 100%;
  background: #eee;
  border-right: 1px solid #ddd;
  box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.1);
  gap: 1rem;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: column;
  overflow: hidden;

  button {
    color: ${({ selectedColor }) => selectedColor};
  }
`

export const Options = styled.div`
  width: 100%;
  gap: 0.5rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

export const Button = styled.button`
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  border-radius: 12px;
  border: 1px solid #ccc;
  background: #fff;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  transform: scale(${({ isActive }) => (isActive ? 0.6 : 1)});

  svg {
    transition: all 0.25s ease-in-out;
  }

  &:hover {
    background: #ddd;

    svg {
      transform: scale(0.9);
    }
  }

  &:active svg {
    transform: scale(1.2);
  }
`

export const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .circle-picker {
    width: 100% !important;
    margin-bottom: 0.5rem !important;
    align-items: center;
    justify-content: center;
  }
`

export const Board = styled.section`
  width: 100%;
  background: #ccc;
  height: 100vh;
  position: relative;
`

export const Canvas = styled.canvas`
  background: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  zoom: ${({ zoom }) => zoom};
  transform: translate(
    ${({ width }) => `${width / -2}px`},
    ${({ height }) => `${height / -2}px`}
  );
  cursor: none;
`

export const Pointer = styled.div`
  position: fixed;
  z-index: 10;
  cursor: none;
  border: 1px solid #000;
  border-radius: 100%;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  display: none;
`
