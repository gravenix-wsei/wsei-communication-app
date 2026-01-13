import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import MessageInput from './MessageInput.vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import * as socketComposable from '@/composables/useSocket'
import apiClient from '@/api/client'

// Mock the socket composable
vi.mock('@/composables/useSocket', () => ({
  useSocket: vi.fn(() => ({
    emit: vi.fn(),
    isConnected: ref(true),
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn()
  }))
}))

// Mock API client
vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn()
  }
}))

describe('MessageInput.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should render input and button', () => {
      const wrapper = mount(MessageInput)

      expect(wrapper.find('input').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('should have empty input initially', () => {
      const wrapper = mount(MessageInput)

      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('should display "Send" button text by default', () => {
      const wrapper = mount(MessageInput)

      const button = wrapper.find('button')
      expect(button.text()).toBe('Send')
    })
  })

  describe('Disabled State', () => {
    it('should disable input when no user is selected', () => {
      const chatStore = useChatStore()
      chatStore.selectedUserId = null

      const wrapper = mount(MessageInput)

      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('should disable button when no user is selected', () => {
      const chatStore = useChatStore()
      chatStore.selectedUserId = null

      const wrapper = mount(MessageInput)

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should disable button when input is empty', () => {
      const chatStore = useChatStore()
      chatStore.selectedUserId = 'user-1'

      const wrapper = mount(MessageInput)

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should disable button when input contains only whitespace', async () => {
      const chatStore = useChatStore()
      chatStore.selectedUserId = 'user-1'

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')

      await input.setValue('   ')

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('Enabled State', () => {
    it('should enable input when user is selected', () => {
      const chatStore = useChatStore()
      chatStore.selectedUserId = 'user-1'

      const wrapper = mount(MessageInput)

      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeUndefined()
    })

    it('should enable button when input has content and user is selected', async () => {
      const chatStore = useChatStore()
      chatStore.selectedUserId = 'user-1'

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')

      await input.setValue('Hello!')

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Sending Messages via Socket.IO', () => {
    it('should emit socket message when socket is connected', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockEmit = vi.fn()
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: mockEmit,
        isConnected: ref(true),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const button = wrapper.find('button')

      await input.setValue('Test message')
      await button.trigger('submit')

      expect(mockEmit).toHaveBeenCalledWith('message:send', {
        recipientId: 'user-1',
        content: 'Test message'
      })
    })

    it('should clear input after sending message via socket', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockEmit = vi.fn()
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: mockEmit,
        isConnected: ref(true),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const form = wrapper.find('form')

      await input.setValue('Test message')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()

      expect(input.element.value).toBe('')
    })
  })

  describe('Sending Messages via REST API', () => {
    it('should use REST API when socket is not connected', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockPost = vi.fn().mockResolvedValue({ data: { success: true } })
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: vi.fn(),
        isConnected: ref(false),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      vi.mocked(apiClient.post).mockImplementation(mockPost)

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const form = wrapper.find('form')

      await input.setValue('Test message')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()

      expect(mockPost).toHaveBeenCalledWith('/api/messages/send', {
        recipientId: 'user-1',
        content: 'Test message'
      })
    })
  })

  describe('Message Trimming', () => {
    it('should trim whitespace from message before sending', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockEmit = vi.fn()
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: mockEmit,
        isConnected: ref(true),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const form = wrapper.find('form')

      await input.setValue('  Test message  ')
      await form.trigger('submit')

      expect(mockEmit).toHaveBeenCalledWith('message:send', {
        recipientId: 'user-1',
        content: 'Test message'
      })
    })
  })

  describe('Loading State', () => {
    it('should show "Sending..." when loading', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockPost = vi.fn().mockImplementation(() => new Promise(() => {}))
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: vi.fn(),
        isConnected: ref(false),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      vi.mocked(apiClient.post).mockImplementation(mockPost)

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const form = wrapper.find('form')

      await input.setValue('Test message')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()

      const button = wrapper.find('button')
      expect(button.text()).toBe('Sending...')
    })

    it('should disable button while sending', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockPost = vi.fn().mockImplementation(() => new Promise(() => {}))
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: vi.fn(),
        isConnected: ref(false),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      vi.mocked(apiClient.post).mockImplementation(mockPost)

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const form = wrapper.find('form')

      await input.setValue('Test message')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should restore message in input on error', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockPost = vi.fn().mockRejectedValue(new Error('Network error'))
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: vi.fn(),
        isConnected: ref(false),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      vi.mocked(apiClient.post).mockImplementation(mockPost)

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const form = wrapper.find('form')

      await input.setValue('Test message')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(input.element.value).toBe('Test message')
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission correctly', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockEmit = vi.fn()
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: mockEmit,
        isConnected: ref(true),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })
      
      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const form = wrapper.find('form')

      await input.setValue('Test message')
      await form.trigger('submit')

      // Should send the message
      expect(mockEmit).toHaveBeenCalledWith('message:send', {
        recipientId: 'user-1',
        content: 'Test message'
      })
    })

    it('should handle enter key press', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockEmit = vi.fn()
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: mockEmit,
        isConnected: ref(true),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')

      await input.setValue('Test message')
      await input.trigger('keyup.enter')

      expect(mockEmit).toHaveBeenCalled()
    })
  })

  describe('Chat Store Integration', () => {
    it('should add message to chat store after sending', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const mockEmit = vi.fn()
      const addMessageSpy = vi.spyOn(chatStore, 'addMessage')
      
      vi.mocked(socketComposable.useSocket).mockReturnValue({
        emit: mockEmit,
        isConnected: ref(true),
        on: vi.fn(),
        connect: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn()
      })

      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(MessageInput)
      const input = wrapper.find('input')
      const form = wrapper.find('form')

      await input.setValue('Test message')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()

      expect(addMessageSpy).toHaveBeenCalled()
      const addedMessage = addMessageSpy.mock.calls[0]?.[0]
      expect(addedMessage?.content).toBe('Test message')
      expect(addedMessage?.sender).toBe('current-user')
      expect(addedMessage?.recipient).toBe('user-1')
    })
  })
})
