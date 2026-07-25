{{- define "quiz-frontend.fullname" -}}
{{ .Release.Name }}
{{- end -}}

{{- define "quiz-frontend.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
