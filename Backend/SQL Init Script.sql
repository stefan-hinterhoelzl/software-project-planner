Drop Table RemoteIssues;
Drop Table RemoteProjects;
Drop Table Viewpoints;
Drop Table Projects;
Drop Table Users;

Create Table Users (
    userId varchar(100) NOT NULL,
    email varchar(100),
    firstname varchar(100),
    lastname varchar(100),
    Primary Key (userId)
);

Create Table Projects (
	projectId 		varchar(100),
    title 			varchar(100),
    description 	varchar(2000),
    owner			varchar(100),
    createdAt 		datetime,
    lastmodified	datetime,
    favourite		boolean,
    Primary Key (ProjectID),
    Foreign Key (owner) References Users (userId) ON DELETE CASCADE
);

Create Table Viewpoints (
    viewpointId 	   int NOT NULL,
    projectId          varchar(100) NOT NULL,
    title              varchar(100),
    lastmodified       datetime,
    Primary Key (projectId, viewpointId),
    Foreign Key (projectId) References Projects (projectId) ON DELETE CASCADE

);

Create Table RemoteProjects (
	projectId		varchar(100) NOT NULL,
    remoteProjectId	int NOT NULL,
    accessToken		varchar(100),
    Primary KEY (projectId, remoteProjectId),
    Foreign Key (projectId) References Projects (projectId) ON DELETE CASCADE
);

Create Table RemoteIssues (
	viewpointId				int NOT NULL,
    projectId				varchar(100) NOT NULL,
    remoteProjectId         int NOT NULL,
    remoteIssueId	        int NOT NULL,
    Primary KEY (viewpointId, projectId, remoteProjectId, remoteIssueId),
    Foreign KEY (projectId, viewpointId) References Viewpoints (projectId, viewpointId) ON DELETE CASCADE
);




    

    
    
    
     