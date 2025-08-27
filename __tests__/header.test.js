import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Header } from "../components/header"
import "@testing-library/jest-dom"

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}))

describe("Header Component", () => {
  test("renders header with logo and navigation", () => {
    render(<Header />)

    expect(screen.getByText("Consoly")).toBeInTheDocument()
    expect(screen.getByText("Community")).toBeInTheDocument()
    expect(screen.getByText("Safety")).toBeInTheDocument()
  })

  test("community button opens dialog", async () => {
    render(<Header />)

    const communityButton = screen.getByText("Community")
    fireEvent.click(communityButton)

    await waitFor(() => {
      expect(screen.getByText("Community Guidelines")).toBeInTheDocument()
      expect(screen.getByText("Our Community Values")).toBeInTheDocument()
    })
  })

  test("safety button opens dialog", async () => {
    render(<Header />)

    const safetyButton = screen.getByText("Safety")
    fireEvent.click(safetyButton)

    await waitFor(() => {
      expect(screen.getByText("Safety & Crisis Resources")).toBeInTheDocument()
      expect(screen.getByText("Crisis Support")).toBeInTheDocument()
    })
  })

  test("mobile menu works correctly", async () => {
    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<Header />)

    const menuButton = screen.getByRole("button", { name: /open menu/i })
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText("Consoly Menu")).toBeInTheDocument()
    })
  })

  test("crisis hotline links work", async () => {
    render(<Header />)

    const safetyButton = screen.getByText("Safety")
    fireEvent.click(safetyButton)

    await waitFor(() => {
      const callButton = screen.getByText("Call")
      expect(callButton.closest("a")).toHaveAttribute("href", "tel:988")
    })
  })
})

console.log("✅ Header component tests completed")
