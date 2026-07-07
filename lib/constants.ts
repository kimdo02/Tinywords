/** 연속 정답이 이 횟수에 도달하면 단어를 'mastered'로 승격 */
export const MASTER_STREAK = 3;

/** 테스트 기본 문항 수 (부모 모드에서 5~10 사이로 조정) */
export const DEFAULT_TEST_COUNT = 10;
export const MIN_TEST_COUNT = 5;
export const MAX_TEST_COUNT = 10;

/** 게임 한 세션에 다루는 기본 단어 수 */
export const DEFAULT_SESSION_SIZE = 8;

/** 객관식 보기 개수(정답 포함). 단어가 부족하면 가능한 만큼만 사용 */
export const CHOICES_COUNT = 4;

/** 활성 아이 프로필 id를 저장하는 쿠키 이름 */
export const ACTIVE_PROFILE_COOKIE = "tw_active_profile";

/** 부모 모드 잠금 해제 상태를 나타내는 쿠키 이름 */
export const PARENT_UNLOCKED_COOKIE = "tw_parent_unlocked";

/** 아이 프로필 아바타로 사용할 이모지 후보 */
export const AVATAR_EMOJIS = ["🐣", "🐨", "🦊", "🐼", "🦁", "🐯", "🐸", "🐧", "🦄", "🐙"];
