#!/bin/bash
# scripts/generate-docs.sh
# 文档生成脚本 - 将 MD 文件转换为 HTML

set -e

DOCS_DIR="docs"
OUTPUT_DIR="."

# 检查 pandoc 是否安装
if ! command -v pandoc &> /dev/null; then
    echo "Error: pandoc is not installed. Please install it first:"
    echo "  brew install pandoc"
    exit 1
fi

echo "Generating HTML documentation..."

# 转换所有 MD 文件
for file in "$DOCS_DIR"/*.md; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .md)
        output_file="$OUTPUT_DIR/${filename}.html"

        echo "  Converting: $file -> $output_file"

        pandoc "$file" \
            -o "$output_file" \
            --standalone \
            --metadata title="Excalicord - $(echo $filename | sed 's/-/ /g' | sed 's/^./\U&/')" \
            --css=https://cdn.jsdelivr.net/npm/github-markdown-css@5.2.0/github-markdown.min.css \
            --highlight-style=pygments \
            -A "$DOCS_DIR/../scripts/footer.html"
    fi
done

echo "Documentation generation complete!"
echo ""
echo "Generated files:"
ls -la "$OUTPUT_DIR"/*.html 2>/dev/null || echo "  No HTML files found"
