import React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import ProductionTestsComponent from "./ProductionTestsComponent";

export class ProductionTestsWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_component"}>
        <ProductionTestsComponent />
      </div>
    );
  }
}

export default ProductionTestsWidget;
