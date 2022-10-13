import React from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import { WebDSService } from "@webds/service";

import ProductionTestsComponent from "./ProductionTestsComponent";

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
          <ProductionTestsComponent
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

export default ProductionTestsWidget;
