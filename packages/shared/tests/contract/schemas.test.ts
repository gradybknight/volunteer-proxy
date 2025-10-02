import { describe, it, expect } from 'vitest'
import { Schema as S } from '@effect/schema'
import * as Schemas from '../../src'

describe('Schema Contract Tests', () => {
  describe('User Schema', () => {
    it('should encode and decode valid user data', () => {
      const sampleUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        role: 'volunteer' as const,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      }

      const decoded = S.decodeUnknownSync(Schemas.User)(sampleUser)
      expect(decoded).toEqual(sampleUser)
    })

    it('should validate email format', () => {
      const invalidUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'invalid-email',
        passwordHash: 'hashedpassword123',
        role: 'volunteer' as const,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => S.decodeUnknownSync(Schemas.User)(invalidUser)).toThrow()
    })

    it('should validate role is one of admin, volunteer, proxy', () => {
      const invalidUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        role: 'invalid-role',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => S.decodeUnknownSync(Schemas.User)(invalidUser)).toThrow()
    })
  })

  describe('Event Schema', () => {
    it('should encode and decode valid event data', () => {
      const sampleEvent = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Soccer Practice',
        description: 'Weekly soccer practice',
        date: new Date('2025-10-15'),
        startTime: '14:00',
        endTime: '16:00',
        location: 'Main Field',
        createdById: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      }

      const decoded = S.decodeUnknownSync(Schemas.Event)(sampleEvent)
      expect(decoded).toEqual(sampleEvent)
    })

    it('should validate time format', () => {
      const invalidEvent = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Soccer Practice',
        description: 'Weekly soccer practice',
        date: new Date('2025-10-15'),
        startTime: '25:00', // Invalid
        endTime: '16:00',
        location: 'Main Field',
        createdById: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => S.decodeUnknownSync(Schemas.Event)(invalidEvent)).toThrow()
    })

    it('should validate startTime < endTime with refinement', () => {
      const invalidEvent = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Soccer Practice',
        description: 'Weekly soccer practice',
        date: new Date('2025-10-15'),
        startTime: '16:00',
        endTime: '14:00', // End before start
        location: 'Main Field',
        createdById: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Basic Event schema should pass
      const decoded = S.decodeUnknownSync(Schemas.Event)(invalidEvent)
      expect(decoded).toBeDefined()

      // ValidEvent schema should fail
      expect(() => S.decodeUnknownSync(Schemas.ValidEvent)(invalidEvent)).toThrow()
    })
  })

  describe('VolunteerAssignment Schema', () => {
    it('should encode and decode valid assignment data', () => {
      const sampleAssignment = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        volunteerId: '550e8400-e29b-41d4-a716-446655440001',
        eventId: '550e8400-e29b-41d4-a716-446655440002',
        fulfilled: false,
        assignedAt: new Date('2025-01-01T00:00:00Z'),
        fulfilledAt: null,
      }

      const decoded = S.decodeUnknownSync(Schemas.VolunteerAssignment)(sampleAssignment)
      expect(decoded).toEqual(sampleAssignment)
    })

    it('should handle fulfilled assignment with fulfilledAt date', () => {
      const fulfilledAssignment = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        volunteerId: '550e8400-e29b-41d4-a716-446655440001',
        eventId: '550e8400-e29b-41d4-a716-446655440002',
        fulfilled: true,
        assignedAt: new Date('2025-01-01T00:00:00Z'),
        fulfilledAt: new Date('2025-01-02T00:00:00Z'),
      }

      const decoded = S.decodeUnknownSync(Schemas.VolunteerAssignment)(fulfilledAssignment)
      expect(decoded).toEqual(fulfilledAssignment)
    })
  })

  describe('ProxyAvailability Schema', () => {
    it('should encode and decode valid availability data', () => {
      const sampleAvailability = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        proxyId: '550e8400-e29b-41d4-a716-446655440001',
        eventId: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      }

      const decoded = S.decodeUnknownSync(Schemas.ProxyAvailability)(sampleAvailability)
      expect(decoded).toEqual(sampleAvailability)
    })
  })

  describe('Request Schema', () => {
    it('should encode and decode valid request data', () => {
      const sampleRequest = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        volunteerId: '550e8400-e29b-41d4-a716-446655440001',
        proxyId: '550e8400-e29b-41d4-a716-446655440002',
        eventId: '550e8400-e29b-41d4-a716-446655440003',
        status: 'pending' as const,
        volunteerAssignmentId: '550e8400-e29b-41d4-a716-446655440004',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        respondedAt: null,
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      }

      const decoded = S.decodeUnknownSync(Schemas.Request)(sampleRequest)
      expect(decoded).toEqual(sampleRequest)
    })

    it('should validate status is one of pending, accepted, declined', () => {
      const invalidRequest = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        volunteerId: '550e8400-e29b-41d4-a716-446655440001',
        proxyId: '550e8400-e29b-41d4-a716-446655440002',
        eventId: '550e8400-e29b-41d4-a716-446655440003',
        status: 'invalid-status',
        volunteerAssignmentId: '550e8400-e29b-41d4-a716-446655440004',
        createdAt: new Date(),
        respondedAt: null,
        updatedAt: new Date(),
      }

      expect(() => S.decodeUnknownSync(Schemas.Request)(invalidRequest)).toThrow()
    })
  })

  describe('Notification Schema', () => {
    it('should encode and decode valid notification data', () => {
      const sampleNotification = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'request_received' as const,
        message: 'You have a new request',
        relatedRequestId: '550e8400-e29b-41d4-a716-446655440002',
        read: false,
        createdAt: new Date('2025-01-01T00:00:00Z'),
      }

      const decoded = S.decodeUnknownSync(Schemas.Notification)(sampleNotification)
      expect(decoded).toEqual(sampleNotification)
    })

    it('should validate notification type', () => {
      const invalidNotification = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'invalid-type',
        message: 'You have a new request',
        relatedRequestId: null,
        read: false,
        createdAt: new Date(),
      }

      expect(() => S.decodeUnknownSync(Schemas.Notification)(invalidNotification)).toThrow()
    })
  })

  describe('Create Request Schemas', () => {
    it('should validate CreateUserRequest', () => {
      const createUserData = {
        email: 'newuser@example.com',
        password: 'password123',
        role: 'volunteer' as const,
        firstName: 'Jane',
        lastName: 'Smith',
      }

      const decoded = S.decodeUnknownSync(Schemas.CreateUserRequest)(createUserData)
      expect(decoded).toEqual(createUserData)
    })

    it('should validate password minimum length', () => {
      const invalidData = {
        email: 'newuser@example.com',
        password: 'short',
        role: 'volunteer' as const,
        firstName: 'Jane',
        lastName: 'Smith',
      }

      expect(() => S.decodeUnknownSync(Schemas.CreateUserRequest)(invalidData)).toThrow()
    })
  })
})
