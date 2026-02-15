import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import HomePage from '../pages/HomePage';

const meta: Meta<typeof HomePage> = {
  title: 'Pages/HomePage',
  component: HomePage,
  decorators: [
    (Story) => (
      <AuthProvider>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </AuthProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {};
