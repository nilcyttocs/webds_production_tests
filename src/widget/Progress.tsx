import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import CircularProgress from "@mui/material/CircularProgress";

import { Page } from "./ProductionTestsComponent";

import { DEFAULT_TEST_SET_ID } from "./constants";

import { CANVAS_ATTRS } from "./mui_extensions/constants";

import { Canvas } from "./mui_extensions/Canvas";
import { Content } from "./mui_extensions/Content";
import { Controls } from "./mui_extensions/Controls";

import { requestAPI } from "../handler";

const SSE_CLOSED = 2;

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
        }, 1500);
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
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: "divider",
            position: "relative"
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
                width: progress + "%",
                height: "100%",
                backgroundColor: "custom.pass",
                transition: "width 0.5s"
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
              <Stack spacing={2} direction="row">
                <Typography sx={{ color: "black" }}>
                  {testName ? testName : "Preparing..."}
                </Typography>
                {progress < 100 && (
                  <CircularProgress color="primary" size={24} />
                )}
              </Stack>
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
      </Content>
      <Controls
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
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

export default Progress;
