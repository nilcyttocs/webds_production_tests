import React, { useEffect, useState } from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import CircularProgress from "@mui/material/CircularProgress";

import { green, grey, red } from "@mui/material/colors";

import { WebDSService } from "@webds/service";

import { Landing } from "./widget_landing";

import { Edit } from "./widget_edit";

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
  Failure = "FAILURE",
  Progress = "PROGRESS"
}

const WIDTH = 800;
const HEIGHT = 450;

const ProductionTestsContainer = (props: any): JSX.Element => {
  const [page, setPage] = useState<Page>(Page.Landing);
  const [marginLeft, setMarginLeft] = useState<number>(0);
  const [partNumber, setPartNumber] = useState<string>("");
  const [fullPartNumber, setFullPartNumber] = useState<string>("");
  const [failedTestName, setFailedTestName] = useState<string>("");
  const [testRepo, setTestRepo] = useState<any>(null);
  const [selectedTestSetID, setSelectedTestSetID] = useState<string | null>(
    null
  );

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

  const displayPage = (): JSX.Element | null => {
    switch (page) {
      case Page.Landing:
        return (
          <Landing
            width={WIDTH}
            height={HEIGHT}
            theme={webdsTheme}
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
            theme={webdsTheme}
            marginLeft={marginLeft}
            partNumber={partNumber}
            testRepo={testRepo}
            selectedTestSetID={selectedTestSetID}
            changePage={changePage}
            commitCustomTestSets={commitCustomTestSets}
          />
        );
      case Page.Failure:
        return (
          <Failure
            width={WIDTH}
            height={HEIGHT}
            theme={webdsTheme}
            partNumber={partNumber}
            testRepo={testRepo}
            failedTestName={failedTestName}
            changePage={changePage}
          />
        );
      case Page.Progress:
        return (
          <Progress
            width={WIDTH}
            height={HEIGHT}
            theme={webdsTheme}
            partNumber={partNumber}
            fullPartNumber={fullPartNumber}
            testRepo={testRepo}
            selectedTestSetID={selectedTestSetID}
            changePage={changePage}
            commitFailedTestName={commitFailedTestName}
          />
        );
      default:
        return null;
    }
  };

  const initialize = async () => {
    try {
      const fpn = await props.service.touchcomm.getPartNumber();
      setFullPartNumber(fpn);
      setPartNumber(fpn.split("-")[0]);
      const tr = await requestAPI<any>("production-tests/" + fpn);
      if (!tr || Object.keys(tr).length === 0) {
        return;
      }
      setTestRepo(tr);
    } catch (error) {
      console.error(`Failed to get part number and test sets\n${error}`);
    }
    const selector = document.querySelector(".jp-webds-widget-body");
    if (selector) {
      const style = getComputedStyle(selector);
      setMarginLeft(parseInt(style!.marginLeft, 10));
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <div className="jp-webds-widget-body">
      {testRepo ? (
        displayPage()
      ) : (
        <div style={{ marginLeft: 200, marginTop: 200 }}>
          <CircularProgress color="primary" />
        </div>
      )}
    </div>
  );
};

export class ProductionTestsWidget extends ReactWidget {
  service: WebDSService | null = null;

  constructor(service: WebDSService) {
    super();
    this.service = service;
  }

  render(): JSX.Element {
    return (
      <div className="jp-webds-widget">
        <ProductionTestsContainer service={this.service} />
      </div>
    );
  }
}
