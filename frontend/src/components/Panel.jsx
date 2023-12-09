import { FaPaintBrush as PaintBrush, FaEraser as Rubber } from "react-icons/fa"
import { CirclePicker } from "react-color"

import { MIN_LINE_SIZE, MAX_LINE_SIZE, LINE_COLORS } from "../constants"
import { Panel, Options, Button, ColorPicker, Slider } from "./Panel.styled"

const PanelComponent = ({
  lineSize,
  selectedColor,
  selectedTool,
  setSelectedTool,
  setSelectedColor,
  setLineSize,
}) => {
  return (
    <Panel selectedColor={selectedColor}>
      <ColorPicker>
        <CirclePicker
          color={selectedColor}
          onChange={(color) => {
            setSelectedColor(color.hex)
            setSelectedTool("BRUCH")
          }}
          circleSpacing={6}
          colors={LINE_COLORS}
        />
      </ColorPicker>
      <Options>
        <Button
          onClick={() => setSelectedTool("RUBBER")}
          isActive={selectedTool === "RUBBER"}>
          <Rubber />
        </Button>
        <Button
          onClick={() => setSelectedTool("BRUCH")}
          isActive={selectedTool === "BRUCH"}>
          <PaintBrush />
        </Button>
        <Slider
          value={lineSize}
          min={MIN_LINE_SIZE}
          max={MAX_LINE_SIZE}
          onChange={(e) => setLineSize(e.target.value)}
        />
      </Options>
    </Panel>
  )
}

export default PanelComponent
