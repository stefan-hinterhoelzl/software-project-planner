Create Table Projects (
	projectId 		int NOT NULL AUTO_INCREMENT,
    title 			varchar(100),
    description 	varchar(2000),
    owner			varchar(50),
    createdAt 		datetime,
    lastmodified	datetime,
    favourite		boolean,
    Primary Key (ProjectID)
);

Create Table RemoteProjects (
	projectId		int NOT NULL,
    remoteProjectId	int NOT NULL,
    accessToken		varchar(100),
    Primary KEY (projectId, remoteProjectId),
    Foreign Key (projectId) References Projects (projectId) ON DELETE CASCADE
);

Create Table RemoteIssues (
	projectId		int NOT NULL,
    remoteProjectId int NOT NULL,
    issueRemoteId	int NOT NULL,
    Primary KEY (projectId, remoteProjectId, issueRemoteId),
    Foreign KEY (projectId) References Projects (projectId) ON DELETE CASCADE
);




    

    
    
    
     