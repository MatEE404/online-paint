import styled from "styled-components"

export const Panel = styled.section`
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  margin: 1rem 1rem 0 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(1rem);
  border-radius: 12px;
  padding: 0.7rem 2rem;
  box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.3);
  z-index: 11;
  gap: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  button {
    color: ${({ selectedColor }) => selectedColor};
  }

  input[type="range"] {
    border-color: ${({ selectedColor }) => selectedColor};

    &::-webkit-slider-thumb {
      background: ${({ selectedColor }) => selectedColor};
    }
  }
`

export const Options = styled.div`
  gap: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const Button = styled.button`
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  border-radius: 12px;
  border: 1px solid #ccc;
  background: ${({ isActive }) => (isActive ? "#efefef" : "#fff")};
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  transform: scale(${({ isActive }) => (isActive ? 0.85 : 1)});

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

export const Slider = styled.input.attrs({ type: "range" })`
  -webkit-appearance: none;
  width: 8rem;
  height: 1rem;
  background: #efefef;
  outline: none;
  opacity: 0.7;
  border-width: 1px;
  border-radius: 8px;
  border-style: solid;
  -webkit-transition: 0.2s;
  transition: all 0.25s ease-in-out;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  padding: 0.2rem;

  &:hover {
    overflow: visible;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    cursor: pointer;
    transition: all 0.25s ease-in-out;

    &:hover {
      transform: scale(1.8);
    }
  }
`

export const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .circle-picker {
    width: 100% !important;
    margin-right: 0 !important;
    align-items: center;
    justify-content: center;

    div {
      background: #fff;
      border-radius: 100%;
    }
  }
`
