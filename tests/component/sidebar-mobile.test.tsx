import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, Sidebar, SidebarContent, useSidebar } from '@/components/ui/sidebar';
import { setViewportWidth, setMobileViewport, setDesktopViewport } from '../helpers/mock-mobile';

function MobileIndicator() {
  const { isMobile } = useSidebar();
  return <span data-testid="sidebar-is-mobile">{String(isMobile)}</span>;
}

function TestIsMobile() {
  const isMobile = useIsMobile();
  return <span data-testid="is-mobile">{String(isMobile)}</span>;
}

describe('Sidebar mobile rendering', () => {
  beforeEach(() => {
    setViewportWidth(1024);
  });

  it('useIsMobile becomes true after setMobileViewport', async () => {
    setMobileViewport();
    const { getByTestId } = render(<TestIsMobile />);
    await waitFor(() => {
      expect(getByTestId('is-mobile').textContent).toBe('true');
    });
  });

  it('renders mobile branch (no desktop-only wrapper) when viewport is mobile', async () => {
    setMobileViewport();
    const { getByTestId } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Nav</SidebarContent>
        </Sidebar>
        <MobileIndicator />
      </SidebarProvider>
    );

    await waitFor(() => {
      expect(getByTestId('sidebar-is-mobile').textContent).toBe('true');
    });

    const desktopOnly = document.querySelector('[class*="hidden"][class*="md:flex"]');
    expect(desktopOnly).toBeFalsy();
  });

  it('does not render data-mobile when viewport is desktop', async () => {
    setDesktopViewport();
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Nav</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    await waitFor(() => {
      const mobileEl = document.querySelector('[data-mobile="true"]');
      expect(mobileEl).toBeFalsy();
    });
  });
});
