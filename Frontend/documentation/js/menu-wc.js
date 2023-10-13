'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">software-project-planner documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-c6937afb4913bb243f799e0528c5658c3ab82034670b478ae9bb99dee2cac93ddb154030deff3edd13a6434f83f41b632d55099900df981b9a2837639bf618e3"' : 'data-bs-target="#xs-components-links-module-AppModule-c6937afb4913bb243f799e0528c5658c3ab82034670b478ae9bb99dee2cac93ddb154030deff3edd13a6434f83f41b632d55099900df981b9a2837639bf618e3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-c6937afb4913bb243f799e0528c5658c3ab82034670b478ae9bb99dee2cac93ddb154030deff3edd13a6434f83f41b632d55099900df981b9a2837639bf618e3"' :
                                            'id="xs-components-links-module-AppModule-c6937afb4913bb243f799e0528c5658c3ab82034670b478ae9bb99dee2cac93ddb154030deff3edd13a6434f83f41b632d55099900df981b9a2837639bf618e3"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectSearchComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectSearchComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SnackbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SnackbarComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-c6937afb4913bb243f799e0528c5658c3ab82034670b478ae9bb99dee2cac93ddb154030deff3edd13a6434f83f41b632d55099900df981b9a2837639bf618e3"' : 'data-bs-target="#xs-injectables-links-module-AppModule-c6937afb4913bb243f799e0528c5658c3ab82034670b478ae9bb99dee2cac93ddb154030deff3edd13a6434f83f41b632d55099900df981b9a2837639bf618e3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-c6937afb4913bb243f799e0528c5658c3ab82034670b478ae9bb99dee2cac93ddb154030deff3edd13a6434f83f41b632d55099900df981b9a2837639bf618e3"' :
                                        'id="xs-injectables-links-module-AppModule-c6937afb4913bb243f799e0528c5658c3ab82034670b478ae9bb99dee2cac93ddb154030deff3edd13a6434f83f41b632d55099900df981b9a2837639bf618e3"' }>
                                        <li class="link">
                                            <a href="injectables/DataService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DataService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthenticationModule.html" data-type="entity-link" >AuthenticationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AuthenticationModule-0d384b4409c2f5aa56a3bff5a8d15e9c08cf1026fb24573a5bfcb674f580edb5dc6663bcebff1e598d71b728c8cbf491a2d8d7e056fbdadca9423e0abb7326f3"' : 'data-bs-target="#xs-components-links-module-AuthenticationModule-0d384b4409c2f5aa56a3bff5a8d15e9c08cf1026fb24573a5bfcb674f580edb5dc6663bcebff1e598d71b728c8cbf491a2d8d7e056fbdadca9423e0abb7326f3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthenticationModule-0d384b4409c2f5aa56a3bff5a8d15e9c08cf1026fb24573a5bfcb674f580edb5dc6663bcebff1e598d71b728c8cbf491a2d8d7e056fbdadca9423e0abb7326f3"' :
                                            'id="xs-components-links-module-AuthenticationModule-0d384b4409c2f5aa56a3bff5a8d15e9c08cf1026fb24573a5bfcb674f580edb5dc6663bcebff1e598d71b728c8cbf491a2d8d7e056fbdadca9423e0abb7326f3"' }>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardModule.html" data-type="entity-link" >DashboardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DashboardModule-e0aa74bd8ef584165a795bffde49ae67759da045c54133f8f6475f7fc8651389adcda135da789a18ae31e57dc5f16e649be61f3f3f58015ee1f22be5444ffb34"' : 'data-bs-target="#xs-components-links-module-DashboardModule-e0aa74bd8ef584165a795bffde49ae67759da045c54133f8f6475f7fc8651389adcda135da789a18ae31e57dc5f16e649be61f3f3f58015ee1f22be5444ffb34"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DashboardModule-e0aa74bd8ef584165a795bffde49ae67759da045c54133f8f6475f7fc8651389adcda135da789a18ae31e57dc5f16e649be61f3f3f58015ee1f22be5444ffb34"' :
                                            'id="xs-components-links-module-DashboardModule-e0aa74bd8ef584165a795bffde49ae67759da045c54133f8f6475f7fc8651389adcda135da789a18ae31e57dc5f16e649be61f3f3f58015ee1f22be5444ffb34"' }>
                                            <li class="link">
                                                <a href="components/DashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DialogsModule.html" data-type="entity-link" >DialogsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DialogsModule-520b6cf58d727f617e7d2739f0ddee3713ebd179134b5e90329f1126cb0d554728857bfb2044d1f393f3397cca52bc45a4347bf4a77e3c10818313e3e4f0301b"' : 'data-bs-target="#xs-components-links-module-DialogsModule-520b6cf58d727f617e7d2739f0ddee3713ebd179134b5e90329f1126cb0d554728857bfb2044d1f393f3397cca52bc45a4347bf4a77e3c10818313e3e4f0301b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DialogsModule-520b6cf58d727f617e7d2739f0ddee3713ebd179134b5e90329f1126cb0d554728857bfb2044d1f393f3397cca52bc45a4347bf4a77e3c10818313e3e4f0301b"' :
                                            'id="xs-components-links-module-DialogsModule-520b6cf58d727f617e7d2739f0ddee3713ebd179134b5e90329f1126cb0d554728857bfb2044d1f393f3397cca52bc45a4347bf4a77e3c10818313e3e4f0301b"' }>
                                            <li class="link">
                                                <a href="components/AreYouSureDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AreYouSureDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IssueDetailDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IssueDetailDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NodeBacklogDetailDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NodeBacklogDetailDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NodeTreeDetailDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NodeTreeDetailDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-DialogsModule-520b6cf58d727f617e7d2739f0ddee3713ebd179134b5e90329f1126cb0d554728857bfb2044d1f393f3397cca52bc45a4347bf4a77e3c10818313e3e4f0301b"' : 'data-bs-target="#xs-pipes-links-module-DialogsModule-520b6cf58d727f617e7d2739f0ddee3713ebd179134b5e90329f1126cb0d554728857bfb2044d1f393f3397cca52bc45a4347bf4a77e3c10818313e3e4f0301b"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-DialogsModule-520b6cf58d727f617e7d2739f0ddee3713ebd179134b5e90329f1126cb0d554728857bfb2044d1f393f3397cca52bc45a4347bf4a77e3c10818313e3e4f0301b"' :
                                            'id="xs-pipes-links-module-DialogsModule-520b6cf58d727f617e7d2739f0ddee3713ebd179134b5e90329f1126cb0d554728857bfb2044d1f393f3397cca52bc45a4347bf4a77e3c10818313e3e4f0301b"' }>
                                            <li class="link">
                                                <a href="pipes/MarkdownPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MarkdownPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProjectRoutingModule.html" data-type="entity-link" >ProjectRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ProjectsModule.html" data-type="entity-link" >ProjectsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ProjectsModule-334d12551dd2e13015b0feb5ce07ba37c2c05803a53e04ee2f6f0f0270e3ce3296e8a5884d1a444963bd327ad746adf6de116aa5adfcd4b5dd4eef18cbb4b718"' : 'data-bs-target="#xs-components-links-module-ProjectsModule-334d12551dd2e13015b0feb5ce07ba37c2c05803a53e04ee2f6f0f0270e3ce3296e8a5884d1a444963bd327ad746adf6de116aa5adfcd4b5dd4eef18cbb4b718"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ProjectsModule-334d12551dd2e13015b0feb5ce07ba37c2c05803a53e04ee2f6f0f0270e3ce3296e8a5884d1a444963bd327ad746adf6de116aa5adfcd4b5dd4eef18cbb4b718"' :
                                            'id="xs-components-links-module-ProjectsModule-334d12551dd2e13015b0feb5ce07ba37c2c05803a53e04ee2f6f0f0270e3ce3296e8a5884d1a444963bd327ad746adf6de116aa5adfcd4b5dd4eef18cbb4b718"' }>
                                            <li class="link">
                                                <a href="components/CreateProjectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CreateProjectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectConfigViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectConfigViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectDashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectDashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectItemOptionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectItemOptionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectItemViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectItemViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectListViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectListViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectTreeViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectTreeViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectViewComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/NewViewpointDialogComponent.html" data-type="entity-link" >NewViewpointDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotFoundComponent.html" data-type="entity-link" >NotFoundComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ServerErrorComponent.html" data-type="entity-link" >ServerErrorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ViewpointManagerComponent.html" data-type="entity-link" >ViewpointManagerComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ALMDataAggregator.html" data-type="entity-link" >ALMDataAggregator</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BackendService.html" data-type="entity-link" >BackendService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataService.html" data-type="entity-link" >DataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DialogService.html" data-type="entity-link" >DialogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GitLabAggregator.html" data-type="entity-link" >GitLabAggregator</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GitlabALMService.html" data-type="entity-link" >GitlabALMService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThemingService.html" data-type="entity-link" >ThemingService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/AuthInterceptor.html" data-type="entity-link" >AuthInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/ErrorInterceptor.html" data-type="entity-link" >ErrorInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthguardService.html" data-type="entity-link" >AuthguardService</a>
                            </li>
                            <li class="link">
                                <a href="guards/CanDeactivateGuard.html" data-type="entity-link" >CanDeactivateGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ALMFilteroptions.html" data-type="entity-link" >ALMFilteroptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ALMIssue.html" data-type="entity-link" >ALMIssue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ALMIssueResWrapper.html" data-type="entity-link" >ALMIssueResWrapper</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ALMPaginationoptions.html" data-type="entity-link" >ALMPaginationoptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ALMProject.html" data-type="entity-link" >ALMProject</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ALMTimeStats.html" data-type="entity-link" >ALMTimeStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CanComponentDeactivate.html" data-type="entity-link" >CanComponentDeactivate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DropInfo.html" data-type="entity-link" >DropInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Issue.html" data-type="entity-link" >Issue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IssueErrorObject.html" data-type="entity-link" >IssueErrorObject</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IssueJSONCheckObject.html" data-type="entity-link" >IssueJSONCheckObject</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IssueLink.html" data-type="entity-link" >IssueLink</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IssueNode.html" data-type="entity-link" >IssueNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IssueRelation.html" data-type="entity-link" >IssueRelation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IssueRelationObjects.html" data-type="entity-link" >IssueRelationObjects</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IssueRelationSettings.html" data-type="entity-link" >IssueRelationSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Project.html" data-type="entity-link" >Project</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProjectWrapper.html" data-type="entity-link" >ProjectWrapper</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RemoteProject.html" data-type="entity-link" >RemoteProject</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RemoteProjectDeleteObject.html" data-type="entity-link" >RemoteProjectDeleteObject</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserSettings.html" data-type="entity-link" >UserSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Viewpoint.html" data-type="entity-link" >Viewpoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ViewpointHierarchieSettings.html" data-type="entity-link" >ViewpointHierarchieSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ViewpointLevelLabel.html" data-type="entity-link" >ViewpointLevelLabel</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});