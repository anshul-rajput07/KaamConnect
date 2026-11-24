
import joblib
import re


# ==========================================
# LOAD TRAINED INTENT CLASSIFIER
# ==========================================

model = joblib.load("models/intent_classifier.joblib")


class KaamConnectAssistant:

    ROLES = [
        "electrician",
        "plumber",
        "engineer",
        "driver",
        "cook",
        "teacher",
        "carpenter",
        "painter",
        "mechanic",
        "cleaner",
        "mason",
        "security guard",
        "delivery boy",
        "helper",
        "accountant",
        "maid",
        "labour",
        "labor",
        "welder",
        "tailor",
        "barber",
        "gardener",
        "watchman",
        "nurse",
        "doctor",
        "receptionist",
        "data entry operator",
        "computer operator",
        "salesman",
        "shopkeeper",
        "ac technician",
        "ro technician",
        "technician",
        "construction worker",
        "housekeeping staff",
        "office boy",
        "waiter",
        "chef",
        "supervisor",
        "plaster worker",
        "tile worker",
        "factory worker"
    ]

    SHIFTS = {
        "morning": r"\b(morning|subah|early morning)\b",
        "evening": r"\b(evening|shaam|sham)\b",
        "night": r"\b(night|raat|rat)\b",
        "full-time": r"\b(full.?time|poora din)\b"
    }

    def __init__(self):
        self.reset_context()

    # ==========================================
    # RESET CONTEXT
    # ==========================================

    def reset_context(self):

        self.context = {
            "intent": None,
            "role": None,
            "location": None,
            "shift": None,
            "salary": None
        }

        self.awaiting = None

    # ==========================================
    # ROLE DETECTION
    # ==========================================

    def find_role(self, text):

        msg = text.lower()

        for role in sorted(self.ROLES, key=len, reverse=True):

            pattern = (
                r"(?<!\w)"
                + re.escape(role)
                + r"(?!\w)"
            )

            if re.search(pattern, msg):
                return role

        return None

    # ==========================================
    # RULE-BASED INTENT DETECTION
    # ==========================================

    def detect_rule_intent(self, text):

        msg = text.lower().strip()

        role = self.find_role(msg)

        # Help
        if re.search(
            r"\b(what can you do|what do you do|"
            r"help me|how can you help)\b",
            msg
        ):
            return "help"

        # Registration
        if re.search(
            r"\b(register as a worker|worker registration|"
            r"sign up as a worker)\b",
            msg
        ):
            return "register_worker"

        if re.search(
            r"\b(register as an employer|"
            r"employer registration)\b",
            msg
        ):
            return "register_employer"

        # Posting a job
        if re.search(
            r"\b(post a job|post job|"
            r"create a job vacancy|publish a job)\b",
            msg
        ):
            return "post_job"

        # Job seeker intent
        # Job-related words take priority over worker-search rules.
        if re.search(
            r"\b(job|naukri|employment|vacancy)\b",
            msg
        ) or re.search(
            r"\b(looking for a job|need a job|"
            r"want a job|job chahiye|naukri chahiye|"
            r"kaam chahiye|mujhe kaam chahiye|"
            r"mujhe naukri chahiye)\b",
            msg
        ):
            return "search_job"

        if re.search(
            r"\b(i want to work as|i want to become|"
            r"i want to be a|i am looking for work|"
            r"i'm looking for work)\b",
            msg
        ):
            return "search_job"

        # Employer / worker-search intent
        if re.search(
            r"\b(find me|find a worker|find someone|"
            r"hire|i want to hire|i need a worker|"
            r"looking for a worker|looking for someone|"
            r"worker chahiye|mujhe worker chahiye)\b",
            msg
        ):
            return "find_worker"

        # Role-based worker search
        # Examples:
        # I need a plumber in Delhi
        # Mujhe Mathura mein AC technician chahiye

        if role:

            if re.search(
                r"\b(i need|i want|need a|need an|"
                r"find me|looking for|require)\b",
                msg
            ):
                return "find_worker"

            if re.search(r"\bmujhe\b", msg) and re.search(
                r"\bchahiye\b",
                msg
            ):
                return "find_worker"

        return None

    # ==========================================
    # FINAL INTENT DETECTION
    # ==========================================

    def detect_intent(self, text):

        rule_intent = self.detect_rule_intent(text)

        if rule_intent:
            return rule_intent

        prediction = model.predict([text])[0]

        probabilities = model.predict_proba([text])[0]

        confidence = max(probabilities) * 100

        print(
            f"Classifier confidence: {confidence:.2f}%"
        )

        return prediction

    # ==========================================
    # LOCATION EXTRACTION
    # ==========================================

    def extract_location(self, text):

        # Hindi/Hinglish:
        # Mujhe Mathura mein
        # Greater Noida mein
        # Mathura mein

        hindi_pattern = re.search(
            r"\b(?:mujhe|mujhko|main|mai)\s+"
            r"([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+mein\b|"
            r"\b([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+mein\b",
            text,
            re.IGNORECASE
        )

        if hindi_pattern:

            return next(
                group.strip()
                for group in hindi_pattern.groups()
                if group
            )

        # English:
        # in Delhi
        # in Greater Noida
        # near New Delhi
        # around Meerut

        english_pattern = re.search(
            r"\b(?:in|at|near|around)\s+"
            r"([a-zA-Z]+"
            r"(?:\s+(?!for\b|with\b|during\b|on\b|and\b|to\b)"
            r"[a-zA-Z]+)?)",
            text,
            re.IGNORECASE
        )

        if english_pattern:
            return english_pattern.group(1).strip()

        return None

    # ==========================================
    # SALARY EXTRACTION
    # ==========================================

    def extract_salary(self, text):

        patterns = [
            r"(?:salary|pay|wage|tankhwa)\s*"
            r"(?:is|of|around|approx)?\s*"
            r"(?:₹|rs\.?)?\s*([\d,]{3,10})",

            r"(?:₹|rs\.?)\s*([\d,]{3,10})",

            r"([\d,]{3,10})\s*"
            r"(?:rupees|rupaye|rs\.?|per month|monthly)"
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if match:

                return match.group(1).replace(",", "")

        return None

    # ==========================================
    # DETAIL EXTRACTION
    # ==========================================

    def extract_details(self, text):

        msg = text.lower().strip()

        # ROLE
        role = self.find_role(msg)

        if role:
            self.context["role"] = role

        # LOCATION
        location = self.extract_location(text)

        if location:
            self.context["location"] = location

        # SHIFT
        for shift, pattern in self.SHIFTS.items():

            if re.search(pattern, msg):
                self.context["shift"] = shift
                break

        # SALARY
        salary = self.extract_salary(msg)

        if salary:
            self.context["salary"] = salary

    # ==========================================
    # CHECK MISSING DETAILS
    # ==========================================

    def next_question(self):

        if not self.context["role"]:

            self.awaiting = "role"

            return (
                "What type of job or worker "
                "are you looking for?"
            )

        if not self.context["location"]:

            self.awaiting = "location"

            return "Which city or location?"

        if not self.context["shift"]:

            self.awaiting = "shift"

            return (
                "Which shift do you prefer: "
                "morning, evening, night or full-time?"
            )

        self.awaiting = None

        return self.show_summary()

    # ==========================================
    # SHOW REQUEST SUMMARY
    # ==========================================

    def show_summary(self):

        return (
            "\nHere are your collected details:\n"
            f"Intent: {self.context['intent']}\n"
            f"Role: {self.context['role']}\n"
            f"Location: {self.context['location']}\n"
            f"Shift: {self.context['shift']}\n"
            f"Salary: {self.context['salary'] or 'Not specified'}\n"
            "\nDetails collected successfully! "
            "Job matching will be connected later."
        )

    # ==========================================
    # CONVERSATION RESPONSE
    # ==========================================

    
    def respond(self, text):

        msg = text.strip()

        if not msg:
            return "Please enter something."

        # Cancel
        if msg.lower() in ("cancel", "reset", "start over"):
            self.reset_context()
            return "Your request has been cancelled. How can I help you?"

        # --------------------------------------
        # HANDLE CURRENT PENDING QUESTION FIRST
        # --------------------------------------

        if self.awaiting == "role":
            self.extract_details(msg)

            if not self.context["role"]:
                self.context["role"] = msg

            return self.next_question()

        if self.awaiting == "location":
            self.extract_details(msg)

            if not self.context["location"]:
                self.context["location"] = msg

            return self.next_question()

        if self.awaiting == "shift":
            self.extract_details(msg)

            if not self.context["shift"]:
                return (
                    "Please specify morning, evening, "
                    "night or full-time shift."
                )

            return self.next_question()

        # --------------------------------------
        # DETECT NEW REQUEST
        # --------------------------------------

        new_request_intent = self.detect_rule_intent(msg)

        if new_request_intent in (
            "search_job",
            "find_worker",
            "post_job"
        ):

            self.reset_context()
            self.context["intent"] = new_request_intent

            print("Detected intent:", new_request_intent)

            self.extract_details(msg)

            return self.next_question()

        # --------------------------------------
        # NORMAL INTENT DETECTION
        # --------------------------------------

        intent = self.detect_intent(msg)

        if intent in ("search_job", "find_worker", "post_job"):
            self.reset_context()

        self.context["intent"] = intent

        print("Detected intent:", intent)

        if intent in ("search_job", "find_worker", "post_job"):
            self.extract_details(msg)
            return self.next_question()

        # Keep your existing handlers for all other intents below.


# ==========================================
# MAIN PROGRAM
# ==========================================

if __name__ == "__main__":

    assistant = KaamConnectAssistant()

    print("================================")
    print("       KaamConnect AI")
    print("================================")
    print("Type 'exit' to stop.\n")

    while True:

        user_input = input("You: ").strip()

        if user_input.lower() == "exit":

            print("Assistant: Goodbye!")

            break

        if not user_input:
            continue

        response = assistant.respond(user_input)

        print("Assistant:", response)
