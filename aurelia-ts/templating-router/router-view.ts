import {Container, inject} from 'aurelia-dependency-injection';
import {ViewSlot, ViewStrategy, customElement, noView} from 'aurelia-templating';
import {Router} from 'aurelia-router';
import {Metadata, Origin} from 'aurelia-metadata';

@customElement('router-view')
@noView
@inject(Element, Container, ViewSlot, Router)
export class RouterView {
  public element;
  public container;
  public viewSlot;
  public router;
  public view;
  constructor(element, container, viewSlot, router) {
    this.element = element;
    this.container = container;
    this.viewSlot = viewSlot;
    this.router = router;
    this.router.registerViewPort(this, this.element.getAttribute('name'));
  }

  bind(executionContext){
    this.container.viewModel = executionContext;
  }

  process(viewPortInstruction, waitToSwap) {
    var component = viewPortInstruction.component,
        viewStrategy = component.view,
        childContainer = component.childContainer,
        viewModel = component.executionContext,
        viewModelResource = component.viewModelResource,
        metadata = viewModelResource.metadata;

    if(!viewStrategy && 'getViewStrategy' in viewModel){
      viewStrategy = viewModel.getViewStrategy();
    }

    if(viewStrategy){
      viewStrategy = ViewStrategy.normalize(viewStrategy);
      viewStrategy.makeRelativeTo((<any>(Origin.get(component.router.container.viewModel.constructor))).moduleId);
    }

    return metadata.load(childContainer, viewModelResource.value, viewStrategy, true).then(viewFactory => {
      viewPortInstruction.behavior = metadata.create(childContainer, {
        executionContext:viewModel,
        viewFactory:viewFactory,
        suppressBind:true
      });

      if(waitToSwap){
        return;
      }

      this.swap(viewPortInstruction);
    });
  }

  swap(viewPortInstruction){
    viewPortInstruction.behavior.view.bind(viewPortInstruction.behavior.executionContext);
    this.viewSlot.swap(viewPortInstruction.behavior.view);

    if(this.view){
      this.view.unbind();
    }

    this.view = viewPortInstruction.behavior.view;
  }
}
