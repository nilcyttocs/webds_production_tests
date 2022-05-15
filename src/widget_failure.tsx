import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";

import { Color, Page } from "./widget_container";

export const Failure = (props: any): JSX.Element => {
  const handleDoneButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    props.changePage(Page.Landing);
  };

  return (
    <ThemeProvider theme={props.theme}>
      <Box sx={{ width: props.width + "px" }}>
        <Typography variant="h5" sx={{ height: "50px", textAlign: "center" }}>
          {props.partNumber} Production Tests
        </Typography>
        <Box sx={{ height: "25px" }}>
          <Typography sx={{ textAlign: "center" }}>
            {props.failedTestName}
          </Typography>
        </Box>
        <div style={{ position: "relative" }}>
          <Box
            sx={{
              height: props.height + "px",
              border: 1,
              borderRadius: 1,
              borderColor: Color.grey,
              backgroundColor: Color.red
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography variant="h1" sx={{ color: "black" }}>
              FAIL
            </Typography>
          </div>
        </div>
        <div
          style={{
            marginTop: "20px",
            position: "relative",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Button
            onClick={(event) => handleDoneButtonClick(event)}
            sx={{ width: "100px" }}
          >
            Done
          </Button>
          <Button
            variant="text"
            onClick={props.showLog}
            sx={{
              position: "absolute",
              top: "5px",
              right: "20px",
              textTransform: "none"
            }}
          >
            <Typography variant="body2" sx={{ textDecoration: "underline" }}>
              Log
            </Typography>
          </Button>
        </div>
      </Box>
    </ThemeProvider>
  );
};
