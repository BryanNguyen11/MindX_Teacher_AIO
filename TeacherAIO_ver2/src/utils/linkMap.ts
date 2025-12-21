// Obfuscate link mapping to reduce exposure in DevTools (not absolute security)
// Links are base64 encoded and reconstructed at runtime.

type LessonLink = { label: string; url: string };

// Split-encoded chunks to avoid trivial grepping
const chunks: Record<string, string[]> = {
  L1: [
    'aHR0cHM6Ly9mb3Jtcy5nbGUv',
    'SEVyUEVxcU5Vb3lXWDVhUDk=',
  ],
  L2: [
    'aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMvZC9lLw==',
    'MUZBSXBRUWxTZm5VdE9Vbk',
    'dHQzbnlGZ0dJVjF0dmxfWE85VWJWeUhNRGVkSEIxc3puVnc=',
    'TDFGZF8yZy92aWV3Zm9ybQ==',
  ],
  L3: [
    'aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMvZC9lLw==',
    'MUZBSXBRUWxTZGVtWmRoRjR6bVh2UEF5T1FSWnZWWnlZdy',
    '91NERPdVlMQlN0WE9LVURxSWI4R1VnL3ZpZXdmb3Jt',
  ],
  L4: [
    'aHR0cHM6Ly9mb3Jtcy5nbGUv',
    'UXFhdnNpVUREckpXV3dUS1g4',
  ],
  L5: [
    'aHR0cHM6Ly9mb3Jtcy5nbGUv',
    'aVZUenlQWHlKREZYVjRobjY=',
  ],
  L6: [
    'aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMvZC9lLw==',
    'MUZBSXBRUWxTY0E4OFBUYVFCR2VxOWJC',
    'R0haYWp4R3ZSelBfamt4bGVtRVhQbjFmN3cwNkhuc2Z3L3ZpZXdmb3Jt',
  ],
  AIStu: [
    'aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMvZC9lLw==',
    'MUZBSXBRUWxTZXdVeUlnaFJjS0NnUG5IUUpETzY3R3o0czhmLWdBYzV5VnRTMzAtLUJWX0hsMHR3L3ZpZXdmb3Jt',
  ],
  AITea: [
    'aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMvZC9lLw==',
    'MUZBSXBRUWxTZXBma0d5MDVLUU0wWFpzdmhoZ3pmeEVqdHlHYWlmV3l3cjBj a3BXSFNMdHlISTVfdw==',
    'L3ZpZXdmb3Jt',
  ],
  AIApp: [
    'aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZm9ybXMvZC9lLw==',
    'MUZBSXBRUWxTZUJTVFUy cEx6ZDd6UXlqbmpSME13SDhyWEU1cmhu eFgtVFd lQWFnVEMtalp0YlE=',
    'L3ZpZXdmb3Jt',
  ],
  L8: [
    'aHR0cHM6Ly9mb3Jtcy5nbGUv',
    'NWt4NjVTQXlWeXNCSlU3SkE=',
  ],
};

function decode(parts: string[]) {
  const base64 = parts.join('').replace(/\s+/g, '');
  try {
    return atob(base64);
  } catch {
    return '';
  }
}

export function getLessonLinks(): LessonLink[] {
  return [
    { label: 'Lesson 1\n[kỹ năng trao đổi với PHHS]', url: decode(chunks.L1) },
    { label: 'Lesson 2\n[Kỹ năng quan sát học viên]', url: decode(chunks.L2) },
    { label: 'Lesson 3\n[Kỹ năng trao đổi với học viên]', url: decode(chunks.L3) },
    { label: 'Lesson 4\n[Định hướng & tạo động lực trong học tập]', url: decode(chunks.L4) },
    { label: 'Lesson 5\n[Hướng dẫn tổ chức học sinh làm dự án cuối khóa]', url: decode(chunks.L5) },
    { label: 'Lesson 6\nHướng dẫn xây dựng bài giảng, giáo án sáng tạo', url: decode(chunks.L6) },
    { label: 'Lesson 7\nỨng dụng AI đổi mới phương pháp và nâng cao hiệu quả giảng dạy', url: decode(chunks.AIApp) },
    { label: 'Lesson 8\nHướng dẫn đánh giá, phản hồi kết quả học tập', url: decode(chunks.L8) },
    { label: 'Lesson 9', url: '' },
    { label: '[Bài tập] Hướng Dẫn Sử Dụng AI4Student cho Giáo Viên', url: decode(chunks.AIStu) },
    { label: '[Bài tập] Hướng Dẫn Sử Dụng AI4Teacher cho Giáo Viên', url: decode(chunks.AITea) },
    { label: '[Bài tập] Ứng dụng AI đổi mới phương pháp và nâng cao hiệu quả giảng dạy', url: decode(chunks.AIApp) },
  ];
}
