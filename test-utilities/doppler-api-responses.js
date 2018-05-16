module.exports = { 
    HOME_200: { 
        message: 'Welcome to Email Marketing Hypermedia API user@example.com, please follow the links.',
        _links: []
    },

    INVALID_TOKEN_401: { 
        title: 'Invalid token',
        detail: 'Authentication Token is not valid',
        errorCode: 1,
        status: 401,
        type: '/docs/errors/401.1-invalid-token',
        _links: []
    },

    FORBIDDEN_WRONG_ACCOUNT_403: { 
        status: 403,
        title: 'Forbidden, wrong account',
        detail: 'Your user otheruser@example.com does not have access to account user@example.com',
        errorCode: 1,
        type: '/docs/errors/403.1-forbidden-wrong-account',
        _links: [] 
    },

    LISTS_PAGE_RESULT_200: { 
        items:
           [ { listId: 1459381,
             name: 'shopify',
             currentStatus: 'ready',
             subscribersCount: 9,
             creationDate: '2018-04-30T23:29:08.067Z',
             _links: [] },
           { listId: 1222381,
             name: 'marketing',
             currentStatus: 'ready',
             subscribersCount: 4,
             creationDate: '2018-03-22T11:47:33.497Z',
             _links: [] },
           { listId: 1170501,
             name: 'development',
             currentStatus: 'ready',
             subscribersCount: 4,
             creationDate: '2017-12-22T21:01:26.08Z',
             _links: [] }],
          pageSize: 200,
          itemsCount: 3,
          currentPage: 1,
          pagesCount: 1,
          _links: []
    },

    IMPORT_TASK_RESULT_200: { 
        importDetails:
        { listId: 776396,
          contentType: 'application/json',
          deleteCustomFieldsData: false,
          status: 'completed',
          numberOfAttempts: 0,
          dateLastImported: '2015-12-23T01:28:31.14',
          processed: 99,
          invalidEmails: 0,
          softBounceds: 0,
          hardBounceds: 0,
          subscriberBounceds: 0,
          amountHeadersAndFieldsDontMatch: 0,
          neverOpenBounceds: 0,
          updated: 0,
          newSubscribers: 99,
          duplicated: 0,
          unsubscribedByUser: 0,
          usersInBlackList: 0,
          duplicatedField: 0 },
         taskType: 'import',
         taskId: 'import-222031',
         itemsProcessed: 99,
         status: 'completed',
         startDate: '2015-12-23T01:28:49.337Z',
         finishDate: '2015-12-23T01:28:31.157Z',
         _links: []
    },

    TASK_NOT_FOUND_404: {
        title: "Entity Not Found",
        detail: "Task `id:import-123456` does not exist for User `id:92651`. - Resolving `/accounts/user@example.com/tasks/import-123456`",
        status: 404,
        errorCode: 1,
        resourceNotFoundPath: "/accounts/user@example.com/tasks/import-123456",
        type: "/docs/errors/404.1-entity-not-found",
        _links: []
    },

    LIST_CREATED_201: {
        createdResourceId: "1462409",
        message: "List successfully created",
        _links: []
    },

    DUPLICATED_LIST_NAME_400: {
        title: "Duplicated list name",
        status: 400,
        errorCode: 2,
        detail: "You've already named another List the same way (`Fresh List`).",
        type: "/docs/errors/400.2-duplicated-list-name",
        _links: []
    },

    FIELDS_RESULT_200: {
        items: [
            {
              name: "presupuesto",
              predefined: false,
              private: true,
              readonly: false,
              type: "number",
              sample: "",
              _links: []
            },
            {
              name: "NroCliente",
              predefined: false,
              private: true,
              readonly: false,
              type: "string",
              sample: "",
              _links: []
            },
            {
              name: "FIRSTNAME",
              predefined: true,
              private: false,
              readonly: false,
              type: "string",
              sample: "FIRST_NAME",
              _links: []
            },
            {
              name: "LASTNAME",
              predefined: true,
              private: false,
              readonly: false,
              type: "string",
              sample: "LAST_NAME",
              _links: []
            },
            {
              name: "EMAIL",
              predefined: true,
              private: false,
              readonly: true,
              type: "email",
              sample: "EMAIL",
              _links: []
            }
          ],
        _links: []
    },

    IMPORT_TASK_CREATED_202: {
        createdResourceId: "import-99562376",
        message: "Import task successfully created",
        _links: []
    },

    SUBSCRIBER_ADDED_TO_LIST_200: {
        message: "Subscriber successfully added to List",
        _links: []
    }
}