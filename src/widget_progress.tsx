import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";

import { Color, Page } from "./widget_container";

import { requestAPI } from "./handler";

const DEFAULT_TEST_SET_ID = "all";

const SSE_CLOSED = 2;

let totalTests = 0;

let eventSource: EventSource | undefined = undefined;

export const Progress = (props: any): JSX.Element => {
  const [pass, setPass] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [testName, setTestName] = useState("");

  const errorHandler = (error: any) => {
    removeEvent();
    console.error(`Error - GET /webds/production-tests\n${error}`);
  };

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
      removeEvent();
      props.commitFailedTestName(name);
      props.changePage(Page.Failure);
    }
  };

  const removeEvent = () => {
    if (eventSource && eventSource.readyState != SSE_CLOSED) {
      eventSource.removeEventListener("production-tests", eventHandler, false);
      eventSource.close();
      eventSource = undefined;
    }
  };

  const addEvent = () => {
    if (eventSource) {
      return;
    }
    eventSource = new window.EventSource("/webds/production-tests");
    eventSource.addEventListener("production-tests", eventHandler, false);
    eventSource.addEventListener("error", errorHandler, false);
    eventSource.onmessage = function (event) {
      if (event.lastEventId == "finished") {
        removeEvent();
        setTimeout(() => {
          setPass(true);
        }, 1000);
      }
    };
  };

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

  const handleDoneButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    props.changePage(Page.Landing);
  };

  const handleAbortButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    removeEvent();
    props.changePage(Page.Landing);
  };

  useEffect(() => {
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
  }, []);

  return (
    <ThemeProvider theme={props.theme}>
      <Box sx={{ width: props.width + "px" }}>
        <Typography variant="h5" sx={{ height: "50px", textAlign: "center" }}>
          {props.partNumber} Production Tests
        </Typography>
        <Box sx={{ height: "25px" }}>
          {pass ? null : (
            <Typography sx={{ textAlign: "center" }}>{testName}</Typography>
          )}
        </Box>
        <div style={{ position: "relative" }}>
          <Box
            sx={{
              height: props.height + "px",
              border: 1,
              borderRadius: 1,
              borderColor: Color.grey,
              backgroundColor: Color.white
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 1,
              bottom: 0,
              left: 1,
              right: 0
            }}
          >
            <Box
              sx={{
                width: Math.floor(((props.width - 2) * progress) / 100) + "px",
                height: props.height + "px",
                border: 0,
                borderRadius: 0,
                backgroundColor: Color.green
              }}
            />
          </div>
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
        </div>
        <div
          style={{
            marginTop: "20px",
            position: "relative",
            display: "flex",
            justifyContent: "center"
          }}
        >
          {pass ? (
            <Button
              onClick={(event) => handleDoneButtonClick(event)}
              sx={{ width: "100px" }}
            >
              Done
            </Button>
          ) : (
            <Button
              onClick={(event) => handleAbortButtonClick(event)}
              sx={{ width: "100px" }}
            >
              Abort
            </Button>
          )}
        </div>
      </Box>
    </ThemeProvider>
  );
};
