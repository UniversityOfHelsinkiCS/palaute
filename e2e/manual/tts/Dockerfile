FROM python:3.14-slim@sha256:0741d101873c12ab927e6f8653feb8862b9bd58771177acb1b885b95141f91b4
COPY --from=ghcr.io/astral-sh/uv:0.12.22@sha256:f513a91fc62fe7c17567eee97230dd198e43edb8a9fbecca843714a4358fe1bc /uv /bin/uv

WORKDIR /app

# antlr4 has no wheel, spacy-pkuseg is only for Chinese
COPY pyproject.toml uv.lock ./
ENV UV_PROJECT_ENVIRONMENT=/usr/local
RUN uv sync --frozen --no-cache --only-group build \
 && uv sync --frozen --no-cache --group build --no-install-package spacy-pkuseg \
    --no-build --no-binary-package antlr4-python3-runtime --no-build-isolation-package antlr4-python3-runtime

ENV MODEL_DIR=/models MODEL_REVISION=5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18
RUN hf download ResembleAI/chatterbox --revision ${MODEL_REVISION} --local-dir ${MODEL_DIR} \
    ve.pt t3_mtl23ls_v2.safetensors s3gen.pt grapheme_mtl_merged_expanded_v1.json conds.pt \
 && rm -rf ${MODEL_DIR}/.cache

COPY --chmod=644 server.py .

RUN useradd --system --no-create-home tts
USER tts

ENV VOICE_DIR=/voices PORT=5005 HF_HUB_OFFLINE=1 HOME=/tmp
EXPOSE 5005
CMD ["python", "server.py"]
