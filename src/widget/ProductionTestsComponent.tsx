import React, { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import Config from "./Config";

import Edit from "./Edit";

import Failure from "./Failure";

import Landing from "./Landing";

import Progress from "./Progress";

import {
  ALERT_MESSAGE_ADD_PUBLIC_CONFIG_JSON,
  ALERT_MESSAGE_ADD_PRIVATE_CONFIG_JSON,
  ALERT_MESSAGE_DEVICE_PART_NUMBER,
  ALERT_MESSAGE_TEST_SETS_START,
  ALERT_MESSAGE_TEST_SETS_END,
  LOG_LOCATION
} from "./constants";

import { requestAPI } from "../handler";

export enum Page {
  Landing = "LANDING",
  Edit = "EDIT",
  Config = "CONFIG",
  Progress = "PROGRESS",
  Failure = "FAILURE"
}

let alertMessage = "";

export const ProductionTestsComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [page, setPage] = useState<Page>(Page.Landing);
  const [partNumber, setPartNumber] = useState<string>("");
  const [fullPartNumber, setFullPartNumber] = useState<string>("");
  const [failedTestName, setFailedTestName] = useState<string>("");
  const [testRepo, setTestRepo] = useState<any>(null);
  const [selectedTestSetID, setSelectedTestSetID] = useState<string | null>(
    null
  );

  const { commands, shell } = props.frontend;

  const showAlert = (message: string) => {
    alertMessage = message;
    setAlert(true);
  };

  const showLog = async () => {
    commands
      .execute("docmanager:open", {
        path: LOG_LOCATION,
        factory: "Editor",
        options: { mode: "split-right" }
      })
      .then((widget: any) => {
        widget.id = "production_tests_log";
        widget.title.closable = true;
        if (!widget.isAttached) shell.add(widget, "main");
        shell.activateById(widget.id);
      });
  };

  const changePage = (newPage: Page) => {
    setPage(newPage);
  };

  const commitFailedTestName = (name: string) => {
    setFailedTestName(name);
  };

  const commitSelectedTestSetID = (selection: string | null) => {
    setSelectedTestSetID(selection);
  };

  const commitCustomTestSets = async (testSets: any) => {
    setTestRepo({
      ...testRepo,
      sets: testSets
    });
    try {
      await requestAPI<any>("production-tests/" + fullPartNumber, {
        body: JSON.stringify(testSets),
        method: "PUT"
      });
    } catch (error) {
      console.error(
        `Error - PUT /webds/production-tests/${fullPartNumber}\n${error}`
      );
    }
  };

  const commitCustomTestSettings = async (testSettings: any) => {
    try {
      await requestAPI<any>("production-tests/" + fullPartNumber, {
        body: JSON.stringify(testSettings),
        method: "PUT"
      });
    } catch (error) {
      console.error(
        `Error - PUT /webds/production-tests/${fullPartNumber}\n${error}`
      );
    }
  };

  const displayPage = (): JSX.Element | null => {
    switch (page) {
      case Page.Landing:
        return (
          <Landing
            partNumber={partNumber}
            testRepo={testRepo}
            selectedTestSetID={selectedTestSetID}
            changePage={changePage}
            commitSelectedTestSetID={commitSelectedTestSetID}
            commitCustomTestSets={commitCustomTestSets}
          />
        );
      case Page.Edit:
        return (
          <Edit
            partNumber={partNumber}
            testRepo={testRepo}
            selectedTestSetID={selectedTestSetID}
            changePage={changePage}
            commitCustomTestSets={commitCustomTestSets}
          />
        );
      case Page.Config:
        return (
          <Config
            partNumber={partNumber}
            testRepo={testRepo}
            changePage={changePage}
            commitCustomTestSettings={commitCustomTestSettings}
          />
        );
      case Page.Failure:
        return (
          <Failure
            partNumber={partNumber}
            testRepo={testRepo}
            failedTestName={failedTestName}
            changePage={changePage}
            showLog={showLog}
          />
        );
      case Page.Progress:
        return (
          <Progress
            partNumber={partNumber}
            fullPartNumber={fullPartNumber}
            testRepo={testRepo}
            selectedTestSetID={selectedTestSetID}
            changePage={changePage}
            commitFailedTestName={commitFailedTestName}
            showLog={showLog}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const external = props.service.pinormos.isExternal();
      try {
        if (external) {
          await props.service.packrat.cache.addPublicConfig();
        } else {
          await props.service.packrat.cache.addPrivateConfig();
        }
      } catch (error) {
        console.error(error);
        if (external) {
          showAlert(ALERT_MESSAGE_ADD_PUBLIC_CONFIG_JSON);
        } else {
          showAlert(ALERT_MESSAGE_ADD_PRIVATE_CONFIG_JSON);
        }
        return;
      }
      let fpn = "";
      try {
        fpn = await props.service.touchcomm.getPartNumber();
        fpn = fpn.replace(/ /g, "-");
        setFullPartNumber(fpn);
        setPartNumber(fpn.split("-")[0]);
      } catch (error) {
        console.error(error);
        showAlert(ALERT_MESSAGE_DEVICE_PART_NUMBER);
        return;
      }
      try {
        const tr = await requestAPI<any>("production-tests/" + fpn);
        if (!tr || Object.keys(tr).length === 0) {
          showAlert(
            ALERT_MESSAGE_TEST_SETS_START +
              fpn +
              ". " +
              ALERT_MESSAGE_TEST_SETS_END +
              fpn +
              "."
          );
          return;
        }
        setTestRepo(tr);
      } catch (error) {
        console.error(error);
        showAlert(
          ALERT_MESSAGE_TEST_SETS_START +
            fpn +
            ". " +
            ALERT_MESSAGE_TEST_SETS_END +
            fpn +
            "."
        );
        return;
      }
      setInitialized(true);
    };
    initialize();
  }, []);

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <>
      <ThemeProvider theme={webdsTheme}>
        <div className="jp-webds-widget-body">
          {alert && (
            <Alert
              severity="error"
              onClose={() => setAlert(false)}
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {alertMessage}
            </Alert>
          )}
          {initialized && displayPage()}
        </div>
        {!initialized && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            <CircularProgress color="primary" />
          </div>
        )}
      </ThemeProvider>
    </>
  );
};

export default ProductionTestsComponent;
