import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Page } from "./widget_container";

const showHelp = false;

export const Failure = (props: any): JSX.Element => {
  const handleDoneButtonClick = () => {
    props.changePage(Page.Landing);
  };

  return (
    <>
      <Stack spacing={2}>
        <Box
          sx={{
            width: props.dimensions.width + "px",
            height: props.dimensions.heightTitle + "px",
            position: "relative",
            bgcolor: "section.main"
          }}
        >
          <Typography
            variant="h5"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            {props.partNumber} Production Tests
          </Typography>
          {showHelp && (
            <Button
              variant="text"
              sx={{
                position: "absolute",
                top: "50%",
                left: "16px",
                transform: "translate(0%, -50%)"
              }}
            >
              <Typography variant="body2" sx={{ textDecoration: "underline" }}>
                Help
              </Typography>
            </Button>
          )}
        </Box>
        <Box
          sx={{
            width: props.dimensions.width + "px",
            height: props.dimensions.heightContent + "px",
            position: "relative",
            bgcolor: "colors.red",
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
        <Box
          sx={{
            width: props.dimensions.width + "px",
            minHeight: props.dimensions.heightControls + "px",
            position: "relative",
            bgcolor: "section.main",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{ margin: "24px" }}>
            <Button
              onClick={() => handleDoneButtonClick()}
              sx={{ width: "150px" }}
            >
              Done
            </Button>
          </div>
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
            <Typography variant="body2" sx={{ textDecoration: "underline" }}>
              Log
            </Typography>
          </Button>
        </Box>
      </Stack>
    </>
  );
};
