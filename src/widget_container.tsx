import React, { useEffect, useState } from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { green, grey, red } from "@mui/material/colors";

import { ThemeProvider } from "@mui/material/styles";

import { WebDSService } from "@webds/service";

import { Landing } from "./widget_landing";

import { Edit } from "./widget_edit";

import { Config } from "./widget_config";

import { Failure } from "./widget_failure";

import { Progress } from "./widget_progress";

import { requestAPI } from "./handler";

export const Color = {
  green: green.A400,
  grey: grey[500],
  red: red.A700,
  white: grey[50]
};

export enum Page {
  Landing = "LANDING",
  Edit = "EDIT",
  Config = "CONFIG",
  Failure = "FAILURE",
  Progress = "PROGRESS"
}

const WIDTH = 800;
const HEIGHT = 450;

const logLocation = "Synaptics/_links/Production_Tests_Log";

let alertMessage = "";

const alertMessagePrivateConfig =
  "Failed to retrieve private config JSON file. Please check in file browser in left sidebar and ensure availability of private config JSON file in /Packrat/ directory (e.g. /Packrat/1234567/config_private.json for PR1234567).";

const alertMessageDevicePartNumber = "Failed to read device part number.";

const alertMessageTestSetsStart = "Failed to retrieve test sets for ";

const alertMessageTestSetsEnd = "Production tests not currently available for ";

const ProductionTestsContainer = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [page, setPage] = useState<Page>(Page.Landing);
  const [marginLeft, setMarginLeft] = useState<number>(0);
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
            width={WIDTH}
            height={HEIGHT}
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
            width={WIDTH}
            height={HEIGHT}
            marginLeft={marginLeft}
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
            width={WIDTH}
            height={HEIGHT}
            partNumber={partNumber}
            testRepo={testRepo}
            changePage={changePage}
            commitCustomTestSettings={commitCustomTestSettings}
          />
        );
      case Page.Failure:
        return (
          <Failure
            width={WIDTH}
            height={HEIGHT}
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
            width={WIDTH}
            height={HEIGHT}
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

  const initialize = async () => {
    try {
      await props.service.packrat.cache.addPrivateConfig();
    } catch (error) {
      console.error(error);
      alertMessage = alertMessagePrivateConfig;
      setAlert(true);
      return;
    }
    let fpn = "";
    try {
      fpn = await props.service.touchcomm.getPartNumber();
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
    const selector = document.querySelector(".jp-webds-widget-body");
    if (selector) {
      const style = getComputedStyle(selector);
      setMarginLeft(parseInt(style!.marginLeft, 10));
    }
    setInitialized(true);
  };

  useEffect(() => {
    initialize();
  }, []);

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <div className="jp-webds-widget-body">
      <ThemeProvider theme={webdsTheme}>
        {initialized ? (
          displayPage()
        ) : (
          <>
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
            {alert ? (
              <Alert
                severity="error"
                onClose={() => setAlert(false)}
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {alertMessage}
              </Alert>
            ) : null}
          </>
        )}
      </ThemeProvider>
    </div>
  );
};

export class ProductionTestsWidget extends ReactWidget {
  id: string;
  frontend: JupyterFrontEnd;
  service: WebDSService;

  constructor(id: string, app: JupyterFrontEnd, service: WebDSService) {
    super();
    this.id = id;
    this.frontend = app;
    this.service = service;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_container"} className="jp-webds-widget-container">
        <div id={this.id + "_content"} className="jp-webds-widget">
          <ProductionTestsContainer
            frontend={this.frontend}
            service={this.service}
          />
        </div>
        <div className="jp-webds-widget-shadow jp-webds-widget-shadow-top"></div>
        <div className="jp-webds-widget-shadow jp-webds-widget-shadow-bottom"></div>
      </div>
    );
  }
}
