import { z } from 'zod';

const emailGenerationSchema = z.object({
  leadId: z.string(),
  subject: z.string(),
  body: z.string(),
  personalization_summary: z.string(),
  ai_model: z.string().optional(),
});

type GeneratedEmail = z.infer<typeof emailGenerationSchema>;

interface Campaign {
  id: string;
  name: string;
  base_subject: string;
  base_email: string;
  personalization_level: 'light' | 'balanced' | 'deep';
}

interface Lead {
  id: string;
  business_name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
}

interface GenerateEmailsParams {
  campaign: Campaign;
  leads: Lead[];
}

// Mock email generation for demo mode
function mockGenerateEmails(params: GenerateEmailsParams): GeneratedEmail[] {
  return params.leads.map(lead => ({
    leadId: lead.id,
    subject: `A quick idea for ${lead.business_name}`,
    body: `Hi ${lead.business_name} team,\n\nI came across your ${lead.industry?.toLowerCase() || 'business'} and thought there might be an opportunity to collaborate.\n\nBest regards`,
    personalization_summary: `Mentioned ${lead.industry?.toLowerCase() || 'business'} services in ${lead.location || 'your area'}`,
    ai_model: 'mock',
  }));
}

// Real OpenRouter AI generation
async function generateWithAI(params: GenerateEmailsParams): Promise<GeneratedEmail[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('OPENROUTER_API_KEY not configured, using mock generation');
    return mockGenerateEmails(params);
  }

  const results: GeneratedEmail[] = [];
  const { campaign, leads } = params;

  for (const lead of leads) {
    try {
      const systemPrompt = `You are an expert email copywriter for B2B outreach. Generate personalized emails that:
- Preserve the user's message intent
- Personalize naturally based on the lead's business info
- Keep a professional, friendly tone
- Avoid spammy language, fake facts, invented achievements or statistics
- Never pretend you personally visited/researched something you did not
- Avoid excessive compliments

Respond ONLY with valid JSON in this exact format:
{
  "subject": "personalized subject line",
  "body": "email body text",
  "personalization_summary": "brief summary of what was personalized"
}`;

      const userPrompt = `Generate a personalized outreach email with ${campaign.personalization_level} personalization.

Business: ${lead.business_name}
Industry: ${lead.industry || 'General'}
Location: ${lead.location || 'Not specified'}
Website: ${lead.website || 'Not available'}
Description: ${lead.description || 'No description'}

Base Subject: ${campaign.base_subject}
Base Email: ${campaign.base_email}

Personalization Level: ${campaign.personalization_level}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://leadforge.app',
          'X-Title': 'Lead Forge',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', response.status);
        results.push({
          leadId: lead.id,
          subject: campaign.base_subject.replace('{business}', lead.business_name),
          body: campaign.base_email.replace('{business}', lead.business_name),
          personalization_summary: 'Generated with fallback (API error)',
          ai_model: 'openrouter-fallback',
        });
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in response');
      }

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validated = emailGenerationSchema.parse({
        leadId: lead.id,
        subject: parsed.subject,
        body: parsed.body,
        personalization_summary: parsed.personalization_summary,
        ai_model: 'openrouter',
      });

      results.push(validated);
    } catch (err) {
      console.error(`Error generating email for lead ${lead.id}:`, err);
      // Fallback to base template
      results.push({
        leadId: lead.id,
        subject: campaign.base_subject.replace('{business}', lead.business_name),
        body: campaign.base_email.replace('{business}', lead.business_name),
        personalization_summary: 'Generated with fallback (parse error)',
        ai_model: 'openrouter-fallback',
      });
    }
  }

  return results;
}

export async function generateEmails(params: GenerateEmailsParams): Promise<GeneratedEmail[]> {
  if (!process.env.OPENROUTER_API_KEY) {
    return mockGenerateEmails(params);
  }

  try {
    return await generateWithAI(params);
  } catch (err) {
    console.error('AI generation failed, using mock:', err);
    return mockGenerateEmails(params);
  }
}
