## EasyPost

Tauri + React + TypeScript 기반의 **데스크톱용 REST API 클라이언트**입니다.  
任의의 HTTP 엔드포인트로 GET / POST 요청을 보내고, Header · Body · 응답 내용을 한 화면에서 확인할 수 있습니다.

### 주요 기능

- **GET / POST 요청 전송**
  - 상단에서 HTTP Method와 URL을 선택 후 요청을 전송할 수 있습니다.

### 기술 스택

- **프론트엔드**
  - React 19
  - TypeScript
  - Vite
- **데스크톱 런타임**
  - Tauri 2
- **백엔드 프록시 (내장)**
  - Rust
  - reqwest (HTTP 클라이언트)
  - serde / serde_json (JSON 직렬화)

### 실행 방법

프로젝트 루트(이 README 가 있는 위치)에서 아래 명령어를 실행합니다.

1. 패키지 설치

```bash
npm install
```

2. 개발 모드 실행 (Tauri + React 동시 실행)

```bash
npm run tauri dev
```

3. 프로덕션 빌드 (설치 파일 생성)

```bash
npm run tauri build
```

필요 시 여기에 추가 기능(예: 인증 토큰 저장, 요청 히스토리, 여러 탭 등)을 확장해 나갈 수 있습니다.
