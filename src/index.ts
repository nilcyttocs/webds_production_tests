import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { MainAreaWidget, WidgetTracker } from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";

import { WebDSService } from "@webds/service";

import { productionTestsIcon } from "./icons";

import { ProductionTestsWidget } from "./widget_container";

/**
 * Initialization data for the @webds/production_tests extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "@webds/production_tests:plugin",
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: async (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log("JupyterLab extension @webds/production_tests is activated!");

    let widget: MainAreaWidget;
    const { commands, shell } = app;
    const command: string = "webds_production_tests:open";
    commands.addCommand(command, {
      label: "Production Tests",
      caption: "Production Tests",
      icon: (args: { [x: string]: any }) => {
        return args["isLauncher"] ? productionTestsIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new ProductionTestsWidget(app, service);
          widget = new MainAreaWidget<ProductionTestsWidget>({ content });
          widget.id = "webds_production_tests_widget";
          widget.title.label = "Production Tests";
          widget.title.icon = productionTestsIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, "main");

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: "WebDS - Testing"
    });

    let tracker = new WidgetTracker<MainAreaWidget>({
      namespace: "webds_production_tests"
    });
    restorer.restore(tracker, {
      command,
      name: () => "webds_production_tests"
    });
  }
};

export default plugin;
