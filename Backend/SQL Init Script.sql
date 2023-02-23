Drop Table remoteissues;
Drop Table RemoteProjects;
Drop Table ProjectViewpoints
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
	projectId 		int NOT NULL AUTO_INCREMENT,
    title 			varchar(100),
    description 	varchar(2000),
    owner			varchar(100),
    createdAt 		datetime,
    lastmodified	datetime,
    favourite		boolean,
    Primary Key (ProjectID),
    Foreign Key (owner) References Users (userId) ON DELETE CASCADE
);

Create Table ProjectViewpoints (
    projectViewpointId int NOT NULL,
    projectId          int NOT NULL,
    title              varchar(100),
    lastmodified       datetime,
    Primary Key (projectId, projectViewpointId),
    Foreign Key (projectId) References Projects (projectId) ON DELETE CASCADE

)

Create Table RemoteProjects (
	projectId		int NOT NULL,
    remoteProjectId	int NOT NULL,
    accessToken		varchar(100),
    Primary KEY (projectId, remoteProjectId),
    Foreign Key (projectId) References Projects (projectId) ON DELETE CASCADE
);

Create Table RemoteIssues (
	projectViewpointId		int NOT NULL,
    remoteProjectId         int NOT NULL,
    issueRemoteId	        int NOT NULL,
    Primary KEY (projectViewpointId, remoteProjectId, issueRemoteId),
    Foreign KEY (projectViewpointId) References ProjectViewpoints (projectViewpointId) ON DELETE CASCADE
);




    

    
    
    
     