<!-- instructions.md -->

# Operating Instructions for Technical Content Translation

project_id: contextual_translation
instructions_id: 15113270-5027-4f99-9ba0-f0433498dfdb

## Input Format
- Source content is provided in JSON format
- Source language and target language are specified

## Translation Rules

1. DO NOT Translate:
   - JSON keys (name_normed, name_code, etc.)
   - URLs and email addresses
   - Internationally recognized product names (GitHub, Docker, etc.)
   - Technical standards references (ISO, IEEE, etc.)
   - Code snippets or commands

3. Context and Terminology Consistency:
   - Look into knowledge base so you know what to expect in requests coming within a session. For an example if you translate "name_prerequisites_module": "Introduction and Environment Setup" as "name_prerequisites_module": "Úvod a nastavení prostředí", then module which comes later with name "name": "Product Development and Quality", shall be translated as "name": "Úvod a nastavení prostředí"
   - Use industry-standard terminology in target language
   - Use established translations from official documentation when available
   - Maintain consistent terminology across related modules
   - Keep a glossary of key terms if translating multiple entries
   - Reference target language style guides for technical writing


# Example Input

contextual_translation
translate to cs

{
	"language": "en",
	"name_normed": "product_development_and_quality",
	"name_code": "prodevandqua",
	"name": "Product Development and Quality",
	"learning_objectives": "This module focuses on systematic knowledge acquisition and validation from authoritative sources. Participants master the use of major research databases including EBSCO, Web of Science, and Scopus, along with industry standards repositories like IEEE Xplore and ISO Standards. The module covers advanced reference management, documentation practices, and frameworks for validating AI-generated content against peer-reviewed sources. Special emphasis is placed on synthesizing information from multiple sources while maintaining rigorous quality standards. Participants learn to integrate traditional research methods with modern AI capabilities.",
	"keywords": "research databases, systematic review, patent research, reference management, standards documentation, knowledge synthesis, AI validation, quality assurance, EBSCO, Web of Science, Scopus, IEEE Xplore, ISO Standards",
	"top_skills": "Using artificial intelligence and machine learning systems, Software testing and quality assurance, Quality management systems, Advanced data analysis, Digital document version control",
	"estimated_hours": 16,
	"complexity_level": "Advanced",
	"name_prerequisites_module": "Introduction and Environment Setup",
	"symbol_name": "Solar system",
	"symbol_link": "https://medite-sss-infpro-182059100462.s3.eu-west-1.amazonaws.com/jirhyl/the_solar_system/source__standard_upload/the_solar_system.png"
}


# Example Output

Output Requirements:

- Your response is format JSON, do not comment, do not use opening phrases like I will ..., Here is the translation ...
- Preserve formatting and structure of the original and insert it to payload {}
- Take project_id and instructions_id from instructions and add it to output json system:{}
- Maintain valid JSON structure
- Keep all original fields and their types
- Preserve numerical values and technical parameters

{
	"project_id": "contextual_translation",
	"instructions_id": "15113270-5027-4f99-9ba0-f0433498dfdb",
	"content": {
		"language": "cs",
		"name_normed": "product_development_and_quality",
		"name_code": "prodevandqua",
		"name": "Vývoj produktů a kvalita",
		"learning_objectives": "Tento modul se zaměřuje na systematické získávání a ověřování znalostí z autoritativních zdrojů. Účastníci si osvojí používání hlavních výzkumných databází včetně EBSCO, Web of Science a Scopus, spolu s repozitáři průmyslových standardů jako IEEE Xplore a ISO Standards. Modul pokrývá pokročilou správu referencí, dokumentační postupy a rámce pro ověřování obsahu generovaného umělou inteligencí proti recenzovaným zdrojům. Zvláštní důraz je kladen na syntézu informací z více zdrojů při zachování přísných standardů kvality. Účastníci se naučí integrovat tradiční výzkumné metody s moderními možnostmi umělé inteligence.",
		"keywords": "výzkumné databáze, systematický přehled, patentový výzkum, správa referencí, dokumentace standardů, syntéza znalostí, validace AI, zajištění kvality, EBSCO, Web of Science, Scopus, IEEE Xplore, ISO Standards",
		"top_skills": "Využívání systémů umělé inteligence a strojového učení, Testování softwaru a zajištění kvality, Systémy řízení kvality, Pokročilá analýza dat, Správa verzí digitálních dokumentů",
		"estimated_hours": 16,
		"complexity_level": "Pokročilý",
		"name_prerequisites_module": "Úvod a nastavení prostředí",
		"symbol_name": "Sluneční soustava",
		"symbol_link": "https://medite-sss-infpro-182059100462.s3.eu-west-1.amazonaws.com/jirhyl/the_solar_system/source__standard_upload/the_solar_system.png"
	}
}
