import { NextRequest, NextResponse } from "next/server";

function generateResponse(message: string, topic: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("what is") || lowerMessage.includes("explain")) {
    return `${topic} is a powerful technology/concept that has become essential in modern development. Here's a quick overview:\n\n**Key Points:**\n• It helps solve complex problems efficiently\n• Widely adopted in the industry\n• Has a strong community and ecosystem\n• Continuously evolving with new features\n\nWould you like me to explain any specific aspect in more detail?`;
  }
  
  if (lowerMessage.includes("how to") || lowerMessage.includes("start")) {
    return `Great question! Here's how to get started with ${topic}:\n\n1. **Learn the basics** - Start with fundamental concepts\n2. **Practice regularly** - Build small projects\n3. **Use quality resources** - The ones I've found for you are great starting points\n4. **Join communities** - Connect with other learners\n5. **Build projects** - Apply what you learn\n\nWhich step would you like more details on?`;
  }
  
  if (lowerMessage.includes("best") || lowerMessage.includes("recommend")) {
    return `Based on the resources I've aggregated, here are my top recommendations for learning ${topic}:\n\n🏆 **Top Pick:** The comprehensive course from freeCodeCamp - great for beginners\n📚 **Quick Learning:** Fireship's videos for rapid concept understanding\n💼 **For Interview Prep:** Check out the interview questions video\n\nEach resource has been ranked by our AI based on quality, engagement, and relevance. Would you like me to explain the ranking criteria?`;
  }
  
  if (lowerMessage.includes("difficult") || lowerMessage.includes("hard") || lowerMessage.includes("stuck")) {
    return `It's completely normal to find ${topic} challenging at first! Here are some tips:\n\n💡 **Break it down** - Focus on one concept at a time\n🔄 **Practice actively** - Don't just watch, code along\n📝 **Take notes** - Write down key concepts\n🤝 **Ask questions** - I'm here to help!\n\nWhat specific part are you finding challenging?`;
  }
  
  return `That's a great question about ${topic}! Based on the learning resources I've gathered, here's what I can tell you:\n\nThe topic you're asking about is covered in several of the resources I've ranked. I'd recommend starting with the highest-rated videos for a comprehensive understanding.\n\nIs there a specific aspect of ${topic} you'd like me to elaborate on? I can help you navigate through the resources to find exactly what you need.`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, topic } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = generateResponse(message, topic || "this subject");

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
