/**
 * @vitest-environment jsdom
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LikertItem from './LikertItem.vue'
import { ACCURACY_SCALE } from '../data/scales'

describe('LikertItem', () => {
  it('renders a radio group with the instrument labels', () => {
    const wrapper = mount(LikertItem, {
      props: {
        itemId: 'N1-1',
        text: 'Worry about things.',
        scale: ACCURACY_SCALE,
        modelValue: undefined,
        invalid: false,
      },
    })
    expect(wrapper.get('legend').text()).toBe('Worry about things.')
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(5)
    expect(wrapper.text()).toContain('Very Inaccurate')
    expect(wrapper.text()).toContain('Very Accurate')
  })
})
