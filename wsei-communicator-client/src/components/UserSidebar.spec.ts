import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserSidebar from './UserSidebar.vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'

describe('UserSidebar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Header', () => {
    it('should display "Contacts" header', () => {
      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('Contacts')
    })
  })

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      const chatStore = useChatStore()
      chatStore.loading = true
      chatStore.users = []

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('Loading...')
    })
  })

  describe('Empty State', () => {
    it('should display "No users available" when there are no users', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = []
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('No users available')
    })

    it('should display "No users available" when only current user exists', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [{
        _id: 'current-user',
        email: 'me@example.com',
        nickname: 'Me'
      }]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('No users available')
    })
  })

  describe('User List', () => {
    it('should render user list correctly', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'user1@example.com', nickname: 'User One' },
        { _id: 'user-2', email: 'user2@example.com', nickname: 'User Two' },
        { _id: 'user-3', email: 'user3@example.com' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('User One')
      expect(wrapper.text()).toContain('user1@example.com')
      expect(wrapper.text()).toContain('User Two')
      expect(wrapper.text()).toContain('user2@example.com')
      expect(wrapper.text()).toContain('user3@example.com')
    })

    it('should exclude current user from the list', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'current-user', email: 'me@example.com', nickname: 'Me' },
        { _id: 'user-1', email: 'user1@example.com', nickname: 'User One' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).not.toContain('Me')
      expect(wrapper.text()).not.toContain('me@example.com')
      expect(wrapper.text()).toContain('User One')
    })

    it('should display user buttons', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'user1@example.com', nickname: 'User One' },
        { _id: 'user-2', email: 'user2@example.com', nickname: 'User Two' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(2)
    })
  })

  describe('Display Names', () => {
    it('should display nickname when available', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'john.doe@example.com', nickname: 'Johnny' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('Johnny')
    })

    it('should display email prefix when nickname is not available', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'john.doe@example.com' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('john.doe')
    })

    it('should always display full email address', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'john.doe@example.com', nickname: 'Johnny' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('john.doe@example.com')
    })
  })

  describe('User Selection', () => {
    it('should call loadMessages when user is clicked', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const loadMessagesSpy = vi.spyOn(chatStore, 'loadMessages')
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'user1@example.com', nickname: 'User One' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)
      const button = wrapper.find('button')

      await button.trigger('click')

      expect(loadMessagesSpy).toHaveBeenCalledWith('user-1')
    })

    it('should highlight selected user', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'user1@example.com', nickname: 'User One' },
        { _id: 'user-2', email: 'user2@example.com', nickname: 'User Two' }
      ]
      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      const buttons = wrapper.findAll('button')
      expect(buttons[0]?.classes()).toContain('bg-blue-100')
      expect(buttons[0]?.classes()).toContain('border-blue-500')
    })

    it('should not highlight non-selected users', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'user1@example.com', nickname: 'User One' },
        { _id: 'user-2', email: 'user2@example.com', nickname: 'User Two' }
      ]
      chatStore.selectedUserId = 'user-1'
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      const buttons = wrapper.findAll('button')
      expect(buttons[1]?.classes()).not.toContain('bg-blue-100')
      expect(buttons[1]?.classes()).not.toContain('border-blue-500')
    })

    it('should apply hover effect to user buttons', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'user1@example.com', nickname: 'User One' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      const button = wrapper.find('button')
      expect(button.classes()).toContain('hover:bg-blue-50')
    })
  })

  describe('Multiple Users', () => {
    it('should render multiple users correctly', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'alice@example.com', nickname: 'Alice' },
        { _id: 'user-2', email: 'bob@example.com', nickname: 'Bob' },
        { _id: 'user-3', email: 'charlie@example.com', nickname: 'Charlie' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('Alice')
      expect(wrapper.text()).toContain('Bob')
      expect(wrapper.text()).toContain('Charlie')
      
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(3)
    })

    it('should handle clicking different users', async () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      const loadMessagesSpy = vi.spyOn(chatStore, 'loadMessages')
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'alice@example.com', nickname: 'Alice' },
        { _id: 'user-2', email: 'bob@example.com', nickname: 'Bob' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)
      const buttons = wrapper.findAll('button')

      await buttons[0]?.trigger('click')
      expect(loadMessagesSpy).toHaveBeenCalledWith('user-1')

      await buttons[1]?.trigger('click')
      expect(loadMessagesSpy).toHaveBeenCalledWith('user-2')
      
      expect(loadMessagesSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Styling', () => {
    it('should have correct container styling', () => {
      const wrapper = mount(UserSidebar)

      const container = wrapper.find('.w-64')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('bg-white')
      expect(container.classes()).toContain('border-r')
    })

    it('should have scrollable user list', () => {
      const wrapper = mount(UserSidebar)

      const scrollContainer = wrapper.find('.overflow-y-auto')
      expect(scrollContainer.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle users without nickname', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'test.user@example.com' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('test.user')
      expect(wrapper.text()).toContain('test.user@example.com')
    })

    it('should handle empty nickname', () => {
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.loading = false
      chatStore.users = [
        { _id: 'user-1', email: 'test@example.com', nickname: '' }
      ]
      authStore.user = { id: 'current-user', email: 'me@example.com' }

      const wrapper = mount(UserSidebar)

      expect(wrapper.text()).toContain('test')
      expect(wrapper.text()).toContain('test@example.com')
    })
  })
})
