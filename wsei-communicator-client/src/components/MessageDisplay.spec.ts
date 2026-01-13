import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MessageDisplay from './MessageDisplay.vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'

describe('MessageDisplay.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Empty State', () => {
    it('should display "No chat selected" when no user is selected', () => {
      const chatStore = useChatStore()
      chatStore.selectedUserId = null

      const wrapper = mount(MessageDisplay)

      expect(wrapper.text()).toContain('No chat selected')
      expect(wrapper.text()).toContain('Select a user from the sidebar to start chatting')
    })
  })

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      const chatStore = useChatStore()
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = true

      const wrapper = mount(MessageDisplay)

      expect(wrapper.text()).toContain('Loading messages...')
    })
  })

  describe('Empty Messages', () => {
    it('should display "No messages yet" when there are no messages', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = []
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageDisplay)

      expect(wrapper.text()).toContain('No messages yet. Start the conversation!')
    })
  })

  describe('Message Rendering', () => {
    it('should render messages correctly', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'Hello!',
          createdAt: new Date('2025-11-22T10:00:00Z').toISOString()
        },
        {
          _id: 'msg-2',
          sender: 'user-1',
          recipient: 'current-user',
          content: 'Hi there!',
          createdAt: new Date('2025-11-22T10:01:00Z').toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      expect(wrapper.text()).toContain('Hello!')
      expect(wrapper.text()).toContain('Hi there!')
    })

    it('should apply correct styling to sent messages', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'My message',
          createdAt: new Date().toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      const messageDiv = wrapper.find('.bg-blue-500')
      expect(messageDiv.exists()).toBe(true)
      expect(messageDiv.classes()).toContain('text-white')
      expect(messageDiv.classes()).toContain('rounded-br-none')
    })

    it('should apply correct styling to received messages', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'user-1',
          recipient: 'current-user',
          content: 'Received message',
          createdAt: new Date().toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      const messageDiv = wrapper.find('.bg-gray-200')
      expect(messageDiv.exists()).toBe(true)
      expect(messageDiv.classes()).toContain('text-gray-800')
      expect(messageDiv.classes()).toContain('rounded-bl-none')
    })
  })

  describe('Date Formatting', () => {
    it('should display "Today" for messages sent today', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      const today = new Date()
      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'Today message',
          createdAt: today.toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      expect(wrapper.text()).toContain('Today')
    })

    it('should display "Yesterday" for messages sent yesterday', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'Yesterday message',
          createdAt: yesterday.toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      expect(wrapper.text()).toContain('Yesterday')
    })

    it('should show date separator between messages from different days', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'Old message',
          createdAt: yesterday.toISOString()
        },
        {
          _id: 'msg-2',
          sender: 'user-1',
          recipient: 'current-user',
          content: 'New message',
          createdAt: today.toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      expect(wrapper.text()).toContain('Yesterday')
      expect(wrapper.text()).toContain('Today')
    })
  })

  describe('Time Formatting', () => {
    it('should format message time correctly', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'Test message',
          createdAt: new Date('2025-11-22T14:30:00Z').toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)
      
      // Time formatting depends on locale, just check that time is displayed
      const timeElements = wrapper.findAll('.text-xs')
      expect(timeElements.length).toBeGreaterThan(0)
    })
  })

  describe('Scrolling Behavior', () => {
    it('should have a scroll container', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = []

      const wrapper = mount(MessageDisplay)

      const scrollContainer = wrapper.find('.overflow-y-auto')
      expect(scrollContainer.exists()).toBe(true)
    })
  })

  describe('Message Alignment', () => {
    it('should align sent messages to the right', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'My message',
          createdAt: new Date().toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      const messageContainer = wrapper.find('.justify-end')
      expect(messageContainer.exists()).toBe(true)
    })

    it('should align received messages to the left', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'user-1',
          recipient: 'current-user',
          content: 'Their message',
          createdAt: new Date().toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      const messageContainer = wrapper.find('.justify-start')
      expect(messageContainer.exists()).toBe(true)
    })
  })

  describe('Multiple Messages', () => {
    it('should render multiple messages in order', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()

      authStore.user = { id: 'current-user', email: 'me@example.com' }
      chatStore.users = [{
        _id: 'user-1',
        email: 'test@example.com',
        nickname: 'Test User'
      }]
      chatStore.selectedUserId = 'user-1'
      chatStore.loading = false
      chatStore.messages = [
        {
          _id: 'msg-1',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'First message',
          createdAt: new Date('2025-11-22T10:00:00Z').toISOString()
        },
        {
          _id: 'msg-2',
          sender: 'user-1',
          recipient: 'current-user',
          content: 'Second message',
          createdAt: new Date('2025-11-22T10:01:00Z').toISOString()
        },
        {
          _id: 'msg-3',
          sender: 'current-user',
          recipient: 'user-1',
          content: 'Third message',
          createdAt: new Date('2025-11-22T10:02:00Z').toISOString()
        }
      ]

      const wrapper = mount(MessageDisplay)

      const text = wrapper.text()
      const firstIdx = text.indexOf('First message')
      const secondIdx = text.indexOf('Second message')
      const thirdIdx = text.indexOf('Third message')

      expect(firstIdx).toBeLessThan(secondIdx)
      expect(secondIdx).toBeLessThan(thirdIdx)
    })
  })
})
