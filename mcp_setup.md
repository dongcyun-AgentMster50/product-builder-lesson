# 회사 PC 초기 세팅용 명령어 모음 (MCP)

회사에 있는 PC나 새로운 노트북에서 Claude CLI를 사용할 때, 아래 두 줄의 명령어만 터미널에 복사/붙여넣기 하시면 현재와 똑같은 "최강 조종석" 환경이 구축됩니다.

## 1. Context7 (최신 공식문서 연동)
```bash
claude mcp add context7 npx @context7/mcp
```

## 2. Figma 커뮤니티 버전 (디자인 연동)
```bash
claude mcp add figma-mcp npx mcp-figma -e FIGMA_ACCESS_TOKEN="여기에_발급받은_토큰_붙여넣기"
```

> **주의사항 (중요)**
> * `FIGMA_ACCESS_TOKEN`은 절대로 외부에 유출되거나 GitHub 공개(Public) 저장소에 올라가면 안 됩니다.
> * 이 `mcp_setup_commands.md` 파일 역시 깃허브에 올리지 않는 것을 권장합니다 (또는 올리시더라도 실제 토큰값은 지우고 껍데기만 올려주세요).
> * 회사 PC 세팅이 끝나면 가급적 이 파일을 삭제하거나 `.gitignore`에 추가해서 안전하게 관리하세요!
