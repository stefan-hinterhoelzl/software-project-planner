Drop Table RemoteIssues;
Drop Table remoteissuesrelation;
Drop Table remoteissueskpierrors;
Drop Table RemoteProjects;
Drop Table viewpointhierarchiesettings;
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
    lastModified	datetime,
    favourite		boolean,
    Primary Key (ProjectID),
    Foreign Key (owner) References Users (userId) ON DELETE CASCADE
);

Create Table Viewpoints (
    viewpointId 	   int NOT NULL,
    projectId          varchar(100) NOT NULL,
    title              varchar(100),
    lastModified       datetime NOT NULL,
    lastEvaluated      datetime,
    Primary Key (projectId, viewpointId),
    Foreign Key (projectId) References Projects (projectId) ON DELETE CASCADE
);

Create Table ViewpointHierarchieSettings (
	projectId 			varchar(100) NOT NULL,
    viewpointId			int NOT NULL,
    level               int NOT NULL,
    label               varchar(255) NOT NULL,
    Primary Key (projectId, viewpointId, level),
    Foreign key (projectId, viewpointId) references Viewpoints (projectId, viewpointId) ON DELETE CASCADE
);
    

Create Table RemoteProjects (
	projectId		varchar(100) NOT NULL,
    remoteProjectId	int NOT NULL,
    accessToken		varchar(100),
    dateAdded       datetime NOT NULL,
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

Create Table RemoteIssuesKPIErrors (
	viewpointId             	int NOT NULL,
    projectId					varchar(100) NOT NULL,
    remoteProjectId         	int NOT NULL,
    remoteIssueId		    	int NOT NULL,
    errorIssueRemoteProjectId 	int NOT NULL,
    errorIssueRemoteIssueId 	int NOT NULL,
    type                    	int NOT NULL,
    class                   	int NOT NULL,
    descr                   	varchar(500),
    Primary Key (viewpointId, projectId, remoteProjectId, remoteIssueId, errorIssueRemoteProjectId, errorIssueRemoteIssueId, type, class),
    Foreign Key (viewpointId, projectId, remoteProjectId, remoteIssueId) References RemoteIssues (viewpointId, projectId, remoteProjectId, remoteIssueId) ON DELETE CASCADE,
    Foreign Key (viewpointId, projectId, errorIssueRemoteProjectId, errorIssueRemoteIssueId) References RemoteIssues (viewpointId, projectId, remoteProjectId, remoteIssueId) ON DELETE CASCADE
);

Create Table RemoteIssuesRelation (
    parentIssueId           int NOT NULL,
    parentRemoteProjectId    int NOT NULL,
    childIssueId            int NOT NULL,
    childRemoteProjectId    int NOT NULL,
    projectId               varchar(100) NOT NULL,
    viewpointId             int NOT NULL,
    nodeOrder				int NOT NULL,
    Primary KEY (projectId, viewpointId, parentIssueId, parentRemoteProjectId, childIssueId, childRemoteProjectId),
    Foreign KEY (projectId, viewpointId) References Viewpoints (projectId, viewpointId) ON DELETE CASCADE,
    Foreign KEY (viewpointId, projectId, parentRemoteProjectId, parentIssueId) References RemoteIssues(viewpointId, projectId, remoteProjectId, remoteIssueId) ON DELETE CASCADE,
    Foreign KEY (viewpointId, projectId, childRemoteProjectId, childIssueId) References RemoteIssues(viewpointId, projectId, remoteProjectId, remoteIssueId) ON DELETE CASCADE
);




    

    
    
    
     