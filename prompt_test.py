import requests
import json
import datetime

# --- Configuration ---
API_ENDPOINT_URL = "http://localhost:3000/api/generate"
OUTPUT_FILE_NAME = f"api_stress_test_log_{datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.txt"

# ==============================================================================
# --- TEST SUITE ---
# ==============================================================================

# --- I. Genre & Mood Based ---
# Goal: Test the AI's ability to interpret and generate for various styles.
test_cases_genre_mood = [
    {"id": "genre_happy_pop_4_chords", "payload": {"prompt": "A bright, happy, uplifting pop song chorus.", "numChords": 4}},
    {"id": "genre_sad_acoustic_folk_5_chords", "payload": {"prompt": "A sad, melancholic acoustic folk verse. Simple but emotional.", "numChords": 5}},
    {"id": "genre_hard_rock_riff_4_chords", "payload": {"prompt": "A driving hard rock riff. Mostly power chords are fine, maybe one minor chord.", "numChords": 4}},
    {"id": "genre_swing_jazz_ii_v_i_3_chords", "payload": {"prompt": "A classic swing jazz ii-V-I progression.", "numChords": 3}},
    {"id": "genre_noir_jazz_smoky_4_chords", "payload": {"prompt": "A smoky, dark, noir jazz club progression.", "numChords": 4}},
    {"id": "genre_ambient_electronic_pads_5_chords", "payload": {"prompt": "An ambient electronic piece. Chords for slow, evolving pads. Extended and suspended chords are good.", "numChords": 5}},
    {"id": "genre_synthwave_80s_retro_4_chords", "payload": {"prompt": "A retro 80s synthwave progression. Should feel nostalgic and a bit dramatic.", "numChords": 4}},
    {"id": "genre_epic_cinematic_trailer_6_chords", "payload": {"prompt": "An epic, orchestral cinematic trailer. Big, heroic, and emotional.", "numChords": 6}},
    {"id": "genre_tense_horror_movie_sting_3_chords", "payload": {"prompt": "A tense, dissonant horror movie sting. Use altered or diminished chords to create unease.", "numChords": 3}},
    {"id": "genre_bossa_nova_relaxed_4_chords", "payload": {"prompt": "A relaxed, gentle Bossa Nova progression. Think Jobim.", "numChords": 4}},
    {"id": "genre_flamenco_andalusian_cadence_4_chords", "payload": {"prompt": "A passionate flamenco progression using an Andalusian cadence.", "numChords": 4}},
    {"id": "genre_quirky_video_game_4_chords", "payload": {"prompt": "Music for a quirky puzzle video game. Chords should be a bit unexpected but not jarring.", "numChords": 4}},
    {"id": "mood_peaceful_serene_5_chords", "payload": {"prompt": "A very peaceful and serene progression. Simple triads are best.", "numChords": 5}},
]

# --- II. Technical & Theory Based ---
# Goal: Test if the AI correctly understands and applies music theory instructions.
test_cases_technical = [
    {"id": "tech_specific_m7b5_chord_4_chords", "payload": {"prompt": "A jazz progression that MUST include a half-diminished (m7b5) chord.", "numChords": 4}},
    {"id": "tech_specific_maj7sharp11_chord_3_chords", "payload": {"prompt": "A Lydian-sounding progression featuring a major 7th sharp 11 chord.", "numChords": 3}},
    {"id": "tech_specific_hendrix_chord_4_chords", "payload": {"prompt": "A funk-rock progression built around a dominant 7th sharp 9 chord (the 'Hendrix chord').", "numChords": 4}},
    {"id": "tech_specific_slash_chord_bassline_4_chords", "payload": {"prompt": "Create a progression with a smooth, descending bass line using slash chords / inversions.", "numChords": 4}},
    {"id": "tech_constraint_only_minor_chords_5_chords", "payload": {"prompt": "CRITICAL: The progression must ONLY contain minor type chords (e.g., m, m7, m9). No major or dominant chords.", "numChords": 5}},
    {"id": "tech_constraint_no_dominant_7ths_4_chords", "payload": {"prompt": "A progression that avoids all dominant 7th chords (like G7). Major 7th and minor 7th are okay.", "numChords": 4}},
    {"id": "tech_concept_modal_interchange_4_chords", "payload": {"prompt": "A pop progression that uses one chord from the parallel minor key (modal interchange).", "numChords": 4}},
    {"id": "tech_concept_secondary_dominant_4_chords", "payload": {"prompt": "A progression that uses a secondary dominant to lead to one of the chords.", "numChords": 4}},
]

# --- III. Structural & Edge Cases ---
# Goal: Test API limits and the AI's handling of strange or minimal prompts.
test_cases_structural = [
    {"id": "struct_min_chord_count_2_chords", "payload": {"prompt": "A simple two-chord vamp.", "numChords": 2}},
    {"id": "struct_max_chord_count_8_chords", "payload": {"prompt": "A long, evolving cinematic progression.", "numChords": 8}},
    {"id": "struct_no_numchords_default_behavior", "payload": {"prompt": "A standard rock song."}}, # Should default to 4 chords
    {"id": "struct_vague_prompt_1_word", "payload": {"prompt": "Sad", "numChords": 4}},
    {"id": "struct_non_musical_prompt_color", "payload": {"prompt": "A progression that sounds like the color purple.", "numChords": 5}},
    {"id": "struct_contradictory_prompt", "payload": {"prompt": "A very happy and uplifting funeral march.", "numChords": 4}},
]

# --- IV. "Add Chord" Scenarios ---
# Goal: A focused stress-test of all "add chord" logic paths.
test_cases_add_chord = [
    {"id": "add_chord_middle_to_connect", "payload": {"prompt": "A passing chord to smoothly connect Cmaj7 and Am7", "existingChords": [{"chord": "Cmaj7"}, {"chord": "Am7"}], "addChordPosition": 1}},
    {"id": "add_chord_start_of_progression", "payload": {"prompt": "A strong opening chord that leads well into G major.", "existingChords": [{"chord": "G"}, {"chord": "C"}, {"chord": "D"}], "addChordPosition": 0}},
    {"id": "add_chord_end_of_progression_turnaround", "payload": {"prompt": "A final turnaround chord that creates tension and leads back to the start (Am). An E7 would be a classic choice.", "existingChords": [{"chord": "Am"}, {"chord": "F"}, {"chord": "C"}], "addChordPosition": 3}},
    {"id": "add_chord_to_empty_list_as_starter", "payload": {"prompt": "A single, inspiring chord to start writing a song with.", "existingChords": [], "addChordPosition": 0}},
    {"id": "add_chord_complex_request_in_middle", "payload": {"prompt": "Insert a tense tritone substitution dominant chord here.", "existingChords": [{"chord": "Dm7"}, {"chord": "Cmaj7"}], "addChordPosition": 1}},
    {"id": "add_chord_no_prompt_context_only", "payload": {"existingChords": [{"chord": "F"}, {"chord": "G"}], "addChordPosition": 1}},
]

ALL_TEST_CASES = {
    "Genre & Mood": test_cases_genre_mood,
    "Technical & Theory": test_cases_technical,
    "Structural & Edge Cases": test_cases_structural,
    "Add Chord Scenarios": test_cases_add_chord,
}


def run_test(test_case, file_logger):
    """
    Sends a POST request and provides clear diagnostic output to both
    the console and a log file.
    """
    case_id = test_case['id']
    payload = test_case['payload']

    header = f"--- Running Test Case: {case_id} ---"
    print(header)
    file_logger.write(f"{header}\n")

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    log_entry = [f"Timestamp: {timestamp}"]

    request_str = f"Request Payload:\n{json.dumps(payload, indent=2)}"
    print(request_str)
    log_entry.append(request_str)

    try:
        response = requests.post(API_ENDPOINT_URL, json=payload, headers={'Content-Type': 'application/json'}, timeout=30)

        status_code_str = f"\nResponse Status Code: {response.status_code}"
        print(status_code_str)
        log_entry.append(status_code_str)

        try:
            response_json = response.json()
            success_msg = "✅ Response is VALID JSON."
            print(success_msg)
            log_entry.append(success_msg)

            json_content_str = f"Parsed JSON content:\n{json.dumps(response_json, indent=2)}"
            print(json_content_str)
            log_entry.append(json_content_str)

            if response.status_code >= 400 and response_json.get("details"):
                 details_log = f"\n❗️ Server-side error details found:\n{json.dumps(response_json['details'], indent=2)}"
                 print(details_log)
                 log_entry.append(details_log)

        except json.JSONDecodeError:
            error_msg = "❗️❗️❗️ Response is NOT VALID JSON. ❗️❗️❗️"
            print(error_msg)
            log_entry.append(error_msg)

            raw_text_str = f"Raw text response from server:\n{response.text}"
            print(raw_text_str)
            log_entry.append(raw_text_str)

    except requests.exceptions.RequestException as e:
        error_msg = f"\n--- ❌ CONNECTION/REQUEST ERROR ---\nError during request: {e}"
        print(error_msg)
        log_entry.append(error_msg)

    footer = "--- Test Case Finished ---\n\n"
    print(footer)
    file_logger.write("\n".join(log_entry))
    file_logger.write(f"\n{footer}")

if __name__ == "__main__":
    print(f"Starting comprehensive stress test against API endpoint: {API_ENDPOINT_URL}")
    print(f"Logging detailed results to: {OUTPUT_FILE_NAME}\n")

    with open(OUTPUT_FILE_NAME, 'w', encoding='utf-8') as f:
        f.write(f"API Stress Test Log\n")
        f.write(f"Endpoint: {API_ENDPOINT_URL}\n")
        f.write(f"Test Run Started: {datetime.datetime.now(datetime.timezone.utc).isoformat()}\n\n")

        for category, test_list in ALL_TEST_CASES.items():
            category_header = f"==================== {category.upper()} ====================\n"
            print(category_header)
            f.write(category_header)
            for case in test_list:
                run_test(case, f)

        f.write(f"Test Run Finished: {datetime.datetime.now(datetime.timezone.utc).isoformat()}\n")

    print(f"All tests completed. Results have been logged to {OUTPUT_FILE_NAME}")