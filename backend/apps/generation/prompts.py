def get_prompt_for_type(type: str, text: str) -> str:
    base_instruction = (
        "You are an expert tutor creating study materials from a lecture transcript."
    )

    if type == "summary":
        return f"""{base_instruction}
Create a concise summary of the following text.
Focus on the main concepts and key takeaways.
Structure it with bullet points.

Return your response in JSON format:
{{
    "title": "Suggested Title",
    "summary": "The summary text...",
    "key_points": ["point 1", "point 2"]
}}

Text:
{text}
"""

    elif type == "notes":
        return f"""{base_instruction}
Create detailed study notes from the following text.
Use a hierarchical structure with headings and subheadings.
Include definitions for key terms.

Return your response in JSON format:
{{
    "content": "Markdown formatted study notes..."
}}

Text:
{text}
"""

    elif type == "flashcards":
        return f"""{base_instruction}
Create 10-15 flashcards from the key concepts in the text.
Each flashcard should have a 'front' (question/concept) and 'back' (answer/definition).

Return your response in JSON format:
{{
    "flashcards": [
        {{"front": "concept", "back": "definition"}}
    ]
}}

Text:
{text}
"""

    elif type == "quiz":
        return f"""{base_instruction}
Create a 5-question multiple choice quiz based on the text.
Include the correct answer index (0-3).

Return your response in JSON format:
{{
    "questions": [
        {{
            "question": "The question?",
            "options": ["A", "B", "C", "D"],
            "correct_option": 0,
            "explanation": "Why it is correct"
        }}
    ]
}}

Text:
{text}
"""

    else:
        raise ValueError(f"Unknown material type: {type}")
