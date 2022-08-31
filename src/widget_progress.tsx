import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Page } from "./widget_container";

import { requestAPI } from "./handler";

const DEFAULT_TEST_SET_ID = "all";

const SSE_CLOSED = 2;

const showHelp = false;

let totalTests = 0;

let eventSource: EventSource | undefined = undefined;

export const Progress = (props: any): JSX.Element => {
  const [pass, setPass] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [testName, setTestName] = useState("");

  const eventHandler = (event: any) => {
    const data = JSON.parse(event.data);
    const index = parseInt(data.index, 10);
    const name = data.name.replace(/[a-zA-Z0-9]*_/g, "");
    console.log(data);
    setTestName(name);
    if (data.status === "done" && data.result === "passed") {
      setCurrent(index);
      setProgress(Math.floor((index / totalTests) * 100));
    } else if (data.status === "done" && data.result === "failed") {
      eventSource!.removeEventListener("production-tests", eventHandler, false);
      eventSource!.close();
      eventSource = undefined;
      props.commitFailedTestName(name);
      props.changePage(Page.Failure);
    }
  };

  const removeEvent = () => {
    if (eventSource && eventSource.readyState !== SSE_CLOSED) {
      eventSource.removeEventListener("production-tests", eventHandler, false);
      eventSource.close();
      eventSource = undefined;
    }
  };

  const errorHandler = (error: any) => {
    removeEvent();
    console.error(`Error - GET /webds/production-tests\n${error}`);
  };

  const addEvent = () => {
    if (eventSource) {
      return;
    }
    eventSource = new window.EventSource("/webds/production-tests");
    eventSource.addEventListener("production-tests", eventHandler, false);
    eventSource.addEventListener("error", errorHandler, false);
    eventSource.onmessage = function (event) {
      if (event.lastEventId === "finished") {
        removeEvent();
        setTimeout(() => {
          setPass(true);
        }, 1000);
      }
    };
  };

  const handleDoneButtonClick = () => {
    props.changePage(Page.Landing);
  };

  const handleAbortButtonClick = () => {
    removeEvent();
    props.changePage(Page.Landing);
  };

  useEffect(() => {
    const runTests = async (testSetID: string): Promise<void> => {
      const dataToSend = { test: testSetID };
      try {
        await requestAPI<any>("production-tests/" + props.fullPartNumber, {
          body: JSON.stringify(dataToSend),
          method: "POST"
        });
        addEvent();
      } catch (error) {
        console.error(
          `Error - POST /webds/production-tests/${props.fullPartNumber}\n${error}`
        );
        return Promise.reject("Failed to run tests");
      }
      return Promise.resolve();
    };

    if (props.selectedTestSetID === DEFAULT_TEST_SET_ID) {
      totalTests = [...props.testRepo.common, ...props.testRepo.lib].length;
    } else {
      const selected = props.testRepo.sets.find(
        (item: any) => item.id === props.selectedTestSetID
      );
      totalTests = selected.tests.length;
    }
    setTotal(totalTests);
    runTests(props.selectedTestSetID);
    return () => {
      removeEvent();
    };
  }, []);

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
            bgcolor: "section.main"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0
            }}
          >
            <Box
              sx={{
                width:
                  Math.floor((props.dimensions.width * progress) / 100) + "px",
                height: props.dimensions.heightContent + "px",
                backgroundColor: "colors.green"
              }}
            />
          </div>
          {pass ? null : (
            <div
              style={{
                position: "absolute",
                top: "24px",
                left: "50%",
                transform: "translate(-50%)"
              }}
            >
              <Typography sx={{ color: "black" }}>{testName}</Typography>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            {pass ? (
              <Typography variant="h1" sx={{ color: "black" }}>
                PASS
              </Typography>
            ) : (
              <Typography variant="h1" sx={{ color: "black" }}>
                {current} / {total}
              </Typography>
            )}
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
            {pass ? (
              <Button
                onClick={() => handleDoneButtonClick()}
                sx={{ width: "150px" }}
              >
                Done
              </Button>
            ) : (
              <Button
                onClick={() => handleAbortButtonClick()}
                sx={{ width: "150px" }}
              >
                Abort
              </Button>
            )}
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
