import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { Page } from "./ProductionTestsComponent";

import { CANVAS_ATTRS } from "./mui_extensions/constants";

import { Canvas } from "./mui_extensions/Canvas";
import { Content } from "./mui_extensions/Content";
import { Controls } from "./mui_extensions/Controls";

export const Failure = (props: any): JSX.Element => {
  const handleDoneButtonClick = () => {
    props.changePage(Page.Landing);
  };

  return (
    <Canvas title={props.partNumber + " Production Tests"}>
      <Content>
        <Box
          sx={{
            width: "100%",
            minHeight:
              CANVAS_ATTRS.MIN_HEIGHT_CONTENT -
              CANVAS_ATTRS.PADDING * 2 -
              2 +
              "px",
            bgcolor: "custom.red",
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: "divider",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "50%",
              transform: "translate(-50%)"
            }}
          >
            <Typography sx={{ color: "black" }}>
              {props.failedTestName}
            </Typography>
          </div>
          <div style={{ margin: "24px" }}>
            <Typography variant="h1" sx={{ color: "black" }}>
              FAIL
            </Typography>
          </div>
        </Box>
      </Content>
      <Controls
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Button onClick={() => handleDoneButtonClick()} sx={{ width: "150px" }}>
          Done
        </Button>
        <Button
          variant="text"
          onClick={props.showLog}
          sx={{
            position: "absolute",
            top: "50%",
            right: "24px",
            transform: "translate(0%, -50%)"
          }}
        >
          <Typography variant="underline">Log</Typography>
        </Button>
      </Controls>
    </Canvas>
  );
};

export default Failure;
