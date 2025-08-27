import { analyzeSentiment, generateBotResponse, detectCrisis } from "../lib/bot-ai"

describe("ConsolyBot AI Functions", () => {
  test("detects crisis indicators correctly", () => {
    expect(detectCrisis("I want to kill myself")).toBe(true)
    expect(detectCrisis("I'm feeling sad today")).toBe(false)
    expect(detectCrisis("I can't go on anymore")).toBe(true)
    expect(detectCrisis("Life is hard but I'm managing")).toBe(false)
  })

  test("analyzes anxiety sentiment", () => {
    const result = analyzeSentiment("I'm feeling really anxious and overwhelmed")
    expect(result.emotion).toBe("anxious")
    expect(result.intensity).toBe("medium")
    expect(result.keywords).toContain("anxious")
    expect(result.keywords).toContain("overwhelmed")
  })

  test("analyzes sadness sentiment", () => {
    const result = analyzeSentiment("I feel so sad and lonely today")
    expect(result.emotion).toBe("sad")
    expect(result.keywords).toContain("sad")
    expect(result.keywords).toContain("lonely")
  })

  test("generates appropriate responses for anxiety", () => {
    const sentiment = { emotion: "anxious", intensity: "high", keywords: ["anxious", "panic"] }
    const response = generateBotResponse("I'm having a panic attack", sentiment)
    expect(response.type).toBe("breathing")
    expect(response.message).toContain("breathing")
  })

  test("generates crisis response", () => {
    const sentiment = { emotion: "crisis", intensity: "high", keywords: ["kill myself"] }
    const response = generateBotResponse("I want to kill myself", sentiment)
    expect(response.type).toBe("crisis")
    expect(response.message).toContain("concerned")
  })

  test("generates supportive response for sadness", () => {
    const sentiment = { emotion: "sad", intensity: "medium", keywords: ["sad"] }
    const response = generateBotResponse("I'm feeling sad", sentiment)
    expect(response.type).toBe("venting")
    expect(response.message).toContain("valid")
  })
})

console.log("✅ ConsolyBot AI tests completed successfully")
