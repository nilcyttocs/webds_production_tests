import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { WebDSService, WebDSWidget } from '@webds/service';

import { productionTestsIcon } from './icons';
import ProductionTestsWidget from './widget/ProductionTestsWidget';

namespace Attributes {
  export const command = 'webds_production_tests:open';
  export const id = 'webds_production_tests_widget';
  export const label = 'Production Tests';
  export const caption = 'Production Tests';
  export const category = 'Touch - Assessment';
  export const rank = 10;
}

export let webdsService: WebDSService;

export let frontend: JupyterFrontEnd;

/**
 * Initialization data for the @webds/production_tests extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@webds/production_tests:plugin',
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log('JupyterLab extension @webds/production_tests is activated!');

    webdsService = service;

    frontend = app;

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) => {
        return args['isLauncher'] ? productionTestsIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new ProductionTestsWidget(Attributes.id);
          widget = new WebDSWidget<ProductionTestsWidget>({ content });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = productionTestsIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, 'main');

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, {
      command,
      name: () => Attributes.id
    });
  }
};

export default plugin;
