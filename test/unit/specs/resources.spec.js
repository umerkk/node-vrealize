/* global it beforeEach afterEach describe */
import request from 'request'
var expect = require('chai').expect
var sinon = require('sinon')
require('chai').should()
var NodeVRealize = require('../../../src/index')
var resources = require('../../../src/vra/catalog/resources')

var nodeVRealize = new NodeVRealize()

describe('[vRA - Catalog / Resources]', function () {
  'use strict'
  let sandbox
  let requestGetStub

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    requestGetStub = sandbox.stub(request, 'getAsync')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('getResources method', function () {
    var response = {
      statusCode: 200,
      body: {
        content: [
          {
            name: 'name',
            status: 'status',
            id: 'id',
            resourceTypeRef: {
              label: 'label'
            }
          }
        ]
      }
    }
    var expectedResult = [
      {
        name: 'name',
        status: 'status',
        id: 'id',
        typeRef: 'label'
      }
    ]
    it('should return the good response when all is working fine', function () {
      requestGetStub.resolves(response)

      return nodeVRealize.vra.catalog.getResources()
        .then(function (res) {
          expect(requestGetStub.getCall(0).args[0].url).to.equal(`https:///catalog-service/api/consumer/resources?limit=1000`)
          expect(res).to.deep.equal(expectedResult)
        })
    })

    it('should return the good response (with the correct number of items) when all is working fine', function () {
      requestGetStub.resolves(response)

      return nodeVRealize.vra.catalog.getResources(777)
        .then(function (res) {
          expect(requestGetStub.getCall(0).args[0].url).to.equal(`https:///catalog-service/api/consumer/resources?limit=777`)
          expect(res).to.deep.equal(expectedResult)
        })
    })

    it('should return error with contents of body when getRequest returns non-successful status code', function () {
      var response = {statusCode: 400, body: 'error'}
      requestGetStub.resolves(response)

      nodeVRealize.vra.catalog.getResources()
        .catch(function (error) {
          expect(error).to.equal(response.body)
        })
    })

    it('should return error when getRequest fails', function () {
      var errorMessage = 'error'
      requestGetStub.rejects(errorMessage)

      return nodeVRealize.vra.catalog.getResources()
        .catch(function (error) {
          expect(error.name).to.equal(errorMessage)
        })
    })
  })

  describe('getResourceByName method', function () {
    it('should return error when getRequest fails', function () {
      var errorMessage = 'error'
      requestGetStub.rejects(errorMessage)

      return nodeVRealize.vra.catalog.getResourceByName()
        .catch(function (error) {
          expect(error.name).to.equal(errorMessage)
        })
    })

    it('should return error with contents of body when getRequest returns non-successful status code', function () {
      var response = {statusCode: 400, body: 'error'}
      requestGetStub.resolves(response)

      nodeVRealize.vra.catalog.getResourceByName('name')
        .catch(function (error) {
          expect(error).to.equal(response.body)
        })
    })

    it('should return error with not found message when body content is empty', function () {
      var response = {statusCode: 200, body: {content: []}}
      requestGetStub.resolves(response)
      var resourceName = 'resourceName'

      nodeVRealize.vra.catalog.getResourceByName(resourceName)
        .catch(function (error) {
          expect(error.message).to.equal('Unable to find resource with name: ' + resourceName)
        })
    })

    it('should return contents of body when getRequest returns 200 status code', function () {
      var stubbedResponse = {statusCode: 200,
        body: getActionByNameResponse
      }
      requestGetStub.resolves(stubbedResponse)

      nodeVRealize.vra.catalog.getResourceByName('name')
        .then(function (response) {
          expect(response).to.deep.equal(stubbedResponse.body.content[0])
        })
    })
  })

  describe('getResourceById method', function () {
    it('should return error when getRequest fails', function () {
      var errorMessage = 'error'
      requestGetStub.rejects(errorMessage)

      return nodeVRealize.vra.catalog.getResourceById()
        .catch(function (error) {
          expect(error.name).to.equal(errorMessage)
        })
    })

    it('should return error with contents of body when getRequest returns non-successful status code', function () {
      var response = {statusCode: 400, body: 'error'}
      requestGetStub.resolves(response)

      nodeVRealize.vra.catalog.getResourceById('id')
        .catch(function (error) {
          expect(error).to.equal(response.body)
        })
    })

    it('should return error with not found message when body content is empty', function () {
      var response = {statusCode: 200, body: {content: []}}
      requestGetStub.resolves(response)
      var id = '1234'

      nodeVRealize.vra.catalog.getResourceById(id)
        .catch(function (error) {
          expect(error.message).to.equal('Unable to find resource with id: ' + id)
        })
    })

    it('should return contents of body when getRequest returns 200 status code', function () {
      var stubbedResponse = {statusCode: 200,
        body:
        {
          content: [
            {
              name: '1',
              status: 'status'
            }
          ]}
      }
      requestGetStub.resolves(stubbedResponse)

      nodeVRealize.vra.catalog.getResourceById('id')
        .then(function (response) {
          expect(response).to.deep.equal(stubbedResponse.body.content[0])
        })
    })
  })

  describe('getResourceActions method', function () {
    it('should return error when resourceName cannot be found', function () {
      var errorMessage = 'error'
      requestGetStub.rejects(errorMessage)

      return nodeVRealize.vra.catalog.getResourceActions('name')
        .catch(function (error) {
          expect(error.name).to.equal(errorMessage)
        })
    })

    it('should return error with contents of body when getRequest returns non-successful status code', function () {
      var response = {statusCode: 400, body: 'error'}
      requestGetStub.resolves(response)

      nodeVRealize.vra.catalog.getResourceActions('name')
        .catch(function (error) {
          expect(error).to.equal(response.body)
        })
    })

    it('should return contents of body when getRequest returns 200 status code', function () {
      var resourceIdKey = 'resourceId'
      var stubbedResponse = {statusCode: 200,
        body: actionsForResourceResponse
      }
      requestGetStub.resolves(stubbedResponse)

      nodeVRealize.vra.catalog.getResourceActions('name')
        .then(function (response) {
          expect(response).to.deep.equal(stubbedResponse.body.content)
          expect(response[resourceIdKey]).to.equal(stubbedResponse.body.content[resourceIdKey])
        })
    })
  })

  describe('getResourceActionTemplate method', function () {
    it('should return error when resourceName cannot be found', function () {
      var errorMessage = 'error'
      requestGetStub.rejects(errorMessage)

      return nodeVRealize.vra.catalog.getResourceActionTemplate('id', 'actionId')
        .catch(function (error) {
          expect(error.name).to.equal(errorMessage)
        })
    })

    it('should return error with contents of body when getRequest returns non-successful status code', function () {
      var response = {statusCode: 400, body: 'error'}
      requestGetStub.resolves(response)

      nodeVRealize.vra.catalog.getResourceActionTemplate('id', 'actionId')
        .catch(function (error) {
          expect(error).to.equal(response.body)
        })
    })

    it('should return contents of body when getRequest returns 200 status code', function () {
      var stubbedResponse = {statusCode: 200,
        body: actionTemplate
      }
      requestGetStub.resolves(stubbedResponse)

      nodeVRealize.vra.catalog.getResourceActionTemplate('id', 'actionId')
        .then(function (response) {
          expect(response).to.deep.equal(stubbedResponse.body)
        })
    })
  })

  describe('getResourceActionRequests method', function () {
    it('should return error when resourceName cannot be found', function () {
      var errorMessage = 'error'
      requestGetStub.rejects(errorMessage)

      return nodeVRealize.vra.catalog.getResourceActionRequests('id', 'actionId')
        .catch(function (error) {
          expect(error.name).to.equal(errorMessage)
        })
    })

    it('should return error with contents of body when getRequest returns non-successful status code', function () {
      var response = {statusCode: 400, body: 'error'}
      requestGetStub.resolves(response)

      nodeVRealize.vra.catalog.getResourceActionRequests('id', 'actionId')
        .catch(function (error) {
          expect(error).to.equal(response.body)
        })
    })

    it('should return contents of body when getRequest returns 200 status code', function () {
      var stubbedResponse = {statusCode: 200,
        body: requestByActionResource
      }

      var actionOptions = {
        resourceName: getActionByNameResponse.content[0].name,
        actionName: actionsForResourceResponse.content[0].name
      }

      // eslint-disable-next-line
      var getResourceActionsStub = sandbox.stub(nodeVRealize.vra.catalog, 'getResourceActions').resolves(actionsForResourceResponse.content)
      requestGetStub.resolves(stubbedResponse)

      nodeVRealize.vra.catalog.getResourceActionRequests(actionOptions)
        .then(function (response) {
          expect(response).to.deep.equal(stubbedResponse.body.content)
        })
    })
  })

  describe('getObjectFromKey method', function () {
    it('should return the object when the key is present in the Array', function () {
      var jsonSample = [
        {name: 'test',
          value: 'value'}
      ]
      var obj = resources.getObjectFromKey(jsonSample, 'test')
      expect(obj).to.deep.equal({name: 'test', value: 'value'})
      obj.value = 'value'
      expect(jsonSample[0].value).to.deep.equal('value')
    })

    it('should throw an error when the key is not present in the Array', function () {
      var jsonSample = [
        {'hybris.Hostname.CID': 'te'}
      ]
      var result = function () {
        resources.getObjectFromKey(jsonSample, 'test')
      }
      expect(result).to.throw()
    })
  })

  describe('submitResourceAction method', function () {

  })

  describe('getResourceActionRequests method', function () {

  })
})

var getActionByNameResponse = {
  'links': [],
  'content': [
    {
      '@type': 'CatalogResource',
      'id': '5ba6b907-c254-4ddf-b23c-a1258d69a6d8',
      'iconId': '2595bbda-b2d4-45de-9a6f-f9b2700aa703',
      'resourceTypeRef': {
        'id': 'ycommerce!::!54924efa-3870-4438-9aa4-2e7f34c7ca6d',
        'label': 'NSXEdge'
      },
      'name': 'sy2-dop402-do402-edge-001',
      'description': 'Client:dop402-do402|RangeIP:Range253',
      'status': 'ACTIVE',
      'catalogItem': {
        'id': '2595bbda-b2d4-45de-9a6f-f9b2700aa703',
        'label': 'Create Project Client Networking'
      },
      'requestId': 'dded27f4-0d3d-4cb9-9a7c-be4a580ee07a',
      'requestState': 'SUCCESSFUL',
      'providerBinding': {
        'bindingId': '24916c0e-7f71-4c13-b3ba-7444784ac934',
        'providerRef': {
          'id': 'c0ce7dd0-26fd-440e-a712-f059b555c85a',
          'label': 'XaaS'
        }
      },
      'owners': [
        {
          'tenantName': 'ycommerce',
          'ref': 'c5254635@ycs.io',
          'type': 'USER',
          'value': 'Nicolas Rose'
        }
      ],
      'organization': {
        'tenantRef': 'ycommerce',
        'tenantLabel': 'ycommerce',
        'subtenantRef': '4b1dfb8f-0805-44c6-92d7-587ed3f59ccf',
        'subtenantLabel': 'BG-YCM'
      },
      'dateCreated': '2017-09-21T20:16:05.033Z',
      'lastUpdated': '2017-09-21T20:16:08.924Z',
      'hasLease': false,
      'lease': null,
      'leaseForDisplay': null,
      'hasCosts': false,
      'costs': null,
      'costToDate': null,
      'totalCost': null,
      'expenseMonthToDate': null,
      'parentResourceRef': null,
      'hasChildren': false,
      'operations': null,
      'forms': {
        'catalogResourceInfoHidden': null,
        'details': {
          'type': 'external',
          'formId': 'ycommerce!::!54924efa-3870-4438-9aa4-2e7f34c7ca6d_Resource.Details'
        }
      },
      'resourceData': {
        'entries': [
          {
            'key': 'vmHostName',
            'value': {
              'type': 'string',
              'value': 'NSX-edge-223-0'
            }
          },
          {
            'key': 'vmName',
            'value': {
              'type': 'string',
              'value': 'sy2-dop402-do402-edge-001-0'
            }
          },
          {
            'key': 'datacenterName',
            'value': {
              'type': 'string',
              'value': 'SY2-Sydney'
            }
          },
          {
            'key': 'vmId',
            'value': {
              'type': 'string',
              'value': 'vm-1812'
            }
          },
          {
            'key': 'vcUniqueId',
            'value': {
              'type': 'string',
              'value': '5002487b-bb90-8dbd-0c84-f90492ad65d5'
            }
          },
          {
            'key': 'objectTypeName',
            'value': {
              'type': 'string',
              'value': 'Edge'
            }
          },
          {
            'key': 'description',
            'value': {
              'type': 'string',
              'value': 'Client:dop402-do402|RangeIP:Range253'
            }
          },
          {
            'key': 'type',
            'value': {
              'type': 'string',
              'value': 'Edge'
            }
          },
          {
            'key': 'revision',
            'value': {
              'type': 'string',
              'value': '6'
            }
          },
          {
            'key': 'datacenterMoid',
            'value': {
              'type': 'string',
              'value': 'datacenter-2'
            }
          },
          {
            'key': 'apiVersion',
            'value': {
              'type': 'string',
              'value': '4.0'
            }
          },
          {
            'key': 'dunesId',
            'value': {
              'type': 'string',
              'value': '7c62660f-3918-4364-9905-6a9bdff6b66c/edge-223'
            }
          },
          {
            'key': 'edgeType',
            'value': {
              'type': 'string',
              'value': 'gatewayServices'
            }
          },
          {
            'key': 'name',
            'value': {
              'type': 'string',
              'value': 'sy2-dop402-do402-edge-001'
            }
          },
          {
            'key': 'nics',
            'value': {
              'type': 'string',
              'value': 'com.vmware.o11n.plugins.nsx.model.Nics@734616d5'
            }
          },
          {
            'key': 'tenantId',
            'value': {
              'type': 'string',
              'value': ''
            }
          },
          {
            'key': 'id',
            'value': {
              'type': 'string',
              'value': '7c62660f-3918-4364-9905-6a9bdff6b66c/edge-223'
            }
          },
          {
            'key': 'state',
            'value': {
              'type': 'string',
              'value': 'deployed'
            }
          },
          {
            'key': 'objectId',
            'value': {
              'type': 'string',
              'value': 'edge-223'
            }
          }
        ]
      },
      'destroyDate': null,
      'pendingRequests': []
    }
  ],
  'metadata': {
    'size': 1000,
    'totalElements': 1,
    'totalPages': 1,
    'number': 1,
    'offset': 0
  }
}

var actionsForResourceResponse = {
  'links': [],
  'content': [
    {
      '@type': 'ConsumerResourceOperation',
      'name': 'Destroy Networking Project',
      'description': 'Resource action to use when you need to destroy all the components associated to Networking Project of a client',
      'iconId': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
      'type': 'ACTION',
      'id': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
      'extensionId': null,
      'providerTypeId': 'com.vmware.csp.core.designer.service',
      'bindingId': 'ycommerce!::!70732f38-78c0-471d-98d8-4de36b8e1a85',
      'hasForm': true,
      'formScale': 'BIG'
    },
    {
      '@type': 'ConsumerResourceOperation',
      'name': 'Get Network Path',
      'description': '',
      'iconId': 'fd02692e-2cab-4d6b-bc91-933fea0e5841_icon',
      'type': 'ACTION',
      'id': '1a188d44-571b-45c3-b869-8e845ebce8e6',
      'extensionId': null,
      'providerTypeId': 'com.vmware.csp.core.designer.service',
      'bindingId': 'ycommerce!::!40531612-13c0-4d7b-bd90-550fbd64cb40',
      'hasForm': true,
      'formScale': 'BIG'
    }
  ]
}

var actionTemplate = {
  'type': 'com.vmware.vcac.catalog.domain.request.CatalogResourceRequest',
  'resourceId': '5ba6b907-c254-4ddf-b23c-a1258d69a6d8',
  'actionId': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
  'description': null,
  'data': {}
}

var requestByActionResource =
  {
    'links': [],
    'content': [
      {
        '@type': 'ResourceActionRequest',
        'id': '862390e2-66df-4eff-a905-feb5a19c655a',
        'iconId': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
        'version': 2,
        'requestNumber': 1191,
        'state': 'PRE_REJECTED',
        'description': null,
        'reasons': null,
        'requestedFor': 'C5258260@ycs.io',
        'requestedBy': 'C5258260@ycs.io',
        'organization': {
          'tenantRef': 'ycommerce',
          'tenantLabel': 'ycommerce',
          'subtenantRef': '4b1dfb8f-0805-44c6-92d7-587ed3f59ccf',
          'subtenantLabel': 'BG-YCM'
        },
        'requestorEntitlementId': '45eaa78d-0e30-42dd-9e02-d2b90293a82f',
        'preApprovalId': 'bb3b63bc-89f2-4d63-8087-8387adfe3a14',
        'postApprovalId': null,
        'dateCreated': '2017-10-03T14:21:23.332Z',
        'lastUpdated': '2017-10-03T14:22:51.375Z',
        'dateSubmitted': '2017-10-03T14:21:23.332Z',
        'dateApproved': null,
        'dateCompleted': null,
        'quote': {
          'leasePeriod': null,
          'leaseRate': null,
          'totalLeaseCost': null
        },
        'requestCompletion': null,
        'requestData': {
          'entries': []
        },
        'retriesRemaining': 3,
        'requestedItemName': 'Destroy Networking Project - sy2-dop402-do402-edge-001',
        'requestedItemDescription': 'Resource action to use when you need to destroy all the components associated to Networking Project of a client',
        'components': null,
        'stateName': 'Rejected',
        'resourceRef': {
          'id': '5ba6b907-c254-4ddf-b23c-a1258d69a6d8',
          'label': 'sy2-dop402-do402-edge-001'
        },
        'resourceActionRef': {
          'id': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
          'label': 'Destroy Networking Project'
        },
        'executionStatus': 'STOPPED',
        'waitingStatus': 'NOT_WAITING',
        'approvalStatus': 'REJECTED',
        'phase': 'REJECTED'
      },
      {
        '@type': 'ResourceActionRequest',
        'id': '92e03a3e-7938-4078-8cd6-eb5e790e5259',
        'iconId': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
        'version': 2,
        'requestNumber': 1094,
        'state': 'PRE_REJECTED',
        'description': null,
        'reasons': null,
        'requestedFor': 'C5258260@ycs.io',
        'requestedBy': 'C5258260@ycs.io',
        'organization': {
          'tenantRef': 'ycommerce',
          'tenantLabel': 'ycommerce',
          'subtenantRef': '4b1dfb8f-0805-44c6-92d7-587ed3f59ccf',
          'subtenantLabel': 'BG-YCM'
        },
        'requestorEntitlementId': '45eaa78d-0e30-42dd-9e02-d2b90293a82f',
        'preApprovalId': 'c23b6f44-0849-4428-a4d9-231955a685d7',
        'postApprovalId': null,
        'dateCreated': '2017-09-29T15:12:42.664Z',
        'lastUpdated': '2017-09-29T15:14:06.848Z',
        'dateSubmitted': '2017-09-29T15:12:42.664Z',
        'dateApproved': null,
        'dateCompleted': null,
        'quote': {
          'leasePeriod': null,
          'leaseRate': null,
          'totalLeaseCost': null
        },
        'requestCompletion': null,
        'requestData': {
          'entries': []
        },
        'retriesRemaining': 3,
        'requestedItemName': 'Destroy Networking Project - sy2-dop402-do402-edge-001',
        'requestedItemDescription': 'Resource action to use when you need to destroy all the components associated to Networking Project of a client',
        'components': null,
        'stateName': 'Rejected',
        'resourceRef': {
          'id': '5ba6b907-c254-4ddf-b23c-a1258d69a6d8',
          'label': 'sy2-dop402-do402-edge-001'
        },
        'resourceActionRef': {
          'id': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
          'label': 'Destroy Networking Project'
        },
        'executionStatus': 'STOPPED',
        'waitingStatus': 'NOT_WAITING',
        'approvalStatus': 'REJECTED',
        'phase': 'REJECTED'
      },
      {
        '@type': 'ResourceActionRequest',
        'id': '9f922145-b14b-4f68-b626-0f6e09b725e3',
        'iconId': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
        'version': 2,
        'requestNumber': 1092,
        'state': 'PRE_REJECTED',
        'description': null,
        'reasons': null,
        'requestedFor': 'C5258260@ycs.io',
        'requestedBy': 'C5258260@ycs.io',
        'organization': {
          'tenantRef': 'ycommerce',
          'tenantLabel': 'ycommerce',
          'subtenantRef': '4b1dfb8f-0805-44c6-92d7-587ed3f59ccf',
          'subtenantLabel': 'BG-YCM'
        },
        'requestorEntitlementId': '45eaa78d-0e30-42dd-9e02-d2b90293a82f',
        'preApprovalId': 'b13e31a9-9e57-4c88-be33-f89a45bfecd3',
        'postApprovalId': null,
        'dateCreated': '2017-09-29T14:33:38.466Z',
        'lastUpdated': '2017-09-29T14:35:04.691Z',
        'dateSubmitted': '2017-09-29T14:33:38.466Z',
        'dateApproved': null,
        'dateCompleted': null,
        'quote': {
          'leasePeriod': null,
          'leaseRate': null,
          'totalLeaseCost': null
        },
        'requestCompletion': null,
        'requestData': {
          'entries': []
        },
        'retriesRemaining': 3,
        'requestedItemName': 'Destroy Networking Project - sy2-dop402-do402-edge-001',
        'requestedItemDescription': 'Resource action to use when you need to destroy all the components associated to Networking Project of a client',
        'components': null,
        'stateName': 'Rejected',
        'resourceRef': {
          'id': '5ba6b907-c254-4ddf-b23c-a1258d69a6d8',
          'label': 'sy2-dop402-do402-edge-001'
        },
        'resourceActionRef': {
          'id': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
          'label': 'Destroy Networking Project'
        },
        'executionStatus': 'STOPPED',
        'waitingStatus': 'NOT_WAITING',
        'approvalStatus': 'REJECTED',
        'phase': 'REJECTED'
      },
      {
        '@type': 'ResourceActionRequest',
        'id': 'd0562cd7-fccf-4f59-a0cf-36f737f18e3f',
        'iconId': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
        'version': 2,
        'requestNumber': 1025,
        'state': 'PRE_REJECTED',
        'description': null,
        'reasons': null,
        'requestedFor': 'C5258260@ycs.io',
        'requestedBy': 'C5258260@ycs.io',
        'organization': {
          'tenantRef': 'ycommerce',
          'tenantLabel': 'ycommerce',
          'subtenantRef': '4b1dfb8f-0805-44c6-92d7-587ed3f59ccf',
          'subtenantLabel': 'BG-YCM'
        },
        'requestorEntitlementId': '45eaa78d-0e30-42dd-9e02-d2b90293a82f',
        'preApprovalId': '663506ec-fc06-4718-b044-e813de0404ba',
        'postApprovalId': null,
        'dateCreated': '2017-09-26T15:09:29.789Z',
        'lastUpdated': '2017-09-26T15:10:45.325Z',
        'dateSubmitted': '2017-09-26T15:09:29.789Z',
        'dateApproved': null,
        'dateCompleted': null,
        'quote': {
          'leasePeriod': null,
          'leaseRate': null,
          'totalLeaseCost': null
        },
        'requestCompletion': null,
        'requestData': {
          'entries': []
        },
        'retriesRemaining': 3,
        'requestedItemName': 'Destroy Networking Project - sy2-dop402-do402-edge-001',
        'requestedItemDescription': 'Resource action to use when you need to destroy all the components associated to Networking Project of a client',
        'components': null,
        'stateName': 'Rejected',
        'resourceRef': {
          'id': '5ba6b907-c254-4ddf-b23c-a1258d69a6d8',
          'label': 'sy2-dop402-do402-edge-001'
        },
        'resourceActionRef': {
          'id': '5c13bfd4-5cb6-47d5-bb26-2f83c74d8e35',
          'label': 'Destroy Networking Project'
        },
        'executionStatus': 'STOPPED',
        'waitingStatus': 'NOT_WAITING',
        'approvalStatus': 'REJECTED',
        'phase': 'REJECTED'
      }
    ],
    'metadata': {
      'size': 1000,
      'totalElements': 4,
      'totalPages': 1,
      'number': 1,
      'offset': 0
    }
  }
