import React from "react";

import { JupyterFrontEnd } from "@jupyterlab/application";

import { ReactWidget } from "@jupyterlab/apputils";

import ProductionTestsComponent from "./ProductionTestsComponent";

export class ProductionTestsWidget extends ReactWidget {
  id: string;
  frontend: JupyterFrontEnd;

  constructor(id: string, app: JupyterFrontEnd) {
    super();
    this.id = id;
    this.frontend = app;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_component"}>
        <ProductionTestsComponent frontend={this.frontend} />
      </div>
    );
  }
}

export default ProductionTestsWidget;
