import React, { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import Config from "./Config";

import Edit from "./Edit";

import Failure from "./Failure";

import Landing from "./Landing";

import Progress from "./Progress";

import { requestAPI } from "../handler";

export enum Page {
  Landing = "LANDING",
  Edit = "EDIT",
  Config = "CONFIG",
  Progress = "PROGRESS",
  Failure = "FAILURE"
}

const WIDTH = 800;
const HEIGHT_TITLE = 70;
const HEIGHT_CONTENT = 450;
const HEIGHT_CONTROLS = 120;

const dimensions = {
  width: WIDTH,
  heightTitle: HEIGHT_TITLE,
  heightContent: HEIGHT_CONTENT,
  heightControls: HEIGHT_CONTROLS
};

const logLocation = "Synaptics/_links/Production_Tests_Log";

let alertMessage = "";

const alertMessagePublicConfigJSON =
  "Failed to retrieve config JSON file. Please check in file browser in left sidebar and ensure availability of config JSON file in /Packrat/ directory (e.g. /Packrat/1234567/config.json for PR1234567).";

const alertMessagePrivateConfigJSON =
  "Failed to retrieve config JSON file. Please check in file browser in left sidebar and ensure availability of config JSON file in /Packrat/ directory (e.g. /Packrat/1234567/config_private.json for PR1234567).";

const alertMessageDevicePartNumber = "Failed to read device part number.";

const alertMessageTestSetsStart = "Failed to retrieve test sets for ";

const alertMessageTestSetsEnd = "Production tests not currently available for ";

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

  const showLog = async () => {
    commands
      .execute("docmanager:open", {
        path: logLocation,
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
            dimensions={dimensions}
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
            dimensions={dimensions}
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
            dimensions={dimensions}
            partNumber={partNumber}
            testRepo={testRepo}
            changePage={changePage}
            commitCustomTestSettings={commitCustomTestSettings}
          />
        );
      case Page.Failure:
        return (
          <Failure
            dimensions={dimensions}
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
            dimensions={dimensions}
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
          alertMessage = alertMessagePublicConfigJSON;
        } else {
          alertMessage = alertMessagePrivateConfigJSON;
        }
        setAlert(true);
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
        alertMessage = alertMessageDevicePartNumber;
        setAlert(true);
        return;
      }
      try {
        const tr = await requestAPI<any>("production-tests/" + fpn);
        if (!tr || Object.keys(tr).length === 0) {
          alertMessage =
            alertMessageTestSetsStart +
            fpn +
            ". " +
            alertMessageTestSetsEnd +
            fpn +
            ".";
          setAlert(true);
          return;
        }
        setTestRepo(tr);
      } catch (error) {
        console.error(error);
        alertMessage =
          alertMessageTestSetsStart +
          fpn +
          ". " +
          alertMessageTestSetsEnd +
          fpn +
          ".";
        setAlert(true);
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
